import React, { useState, useEffect } from 'react';
import ProjectDataService from '../service/ProjectDataService';
import AuthenticationService from '../service/AuthenticationService';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, TextField, InputAdornment } from '@mui/material';

const ListProjectsComponent = () => {
    const [projects, setProjects] = useState([]);
    const [userRoles, setUserRoles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const roles = AuthenticationService.getUserRoles();
        setUserRoles(roles);
        if (location.state?.message) {
            setSnackbarMessage(location.state.message);
            setSnackbarSeverity('success'); 
            setOpenSnackbar(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
        refreshProjects();
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        setFilteredProjects(
            projects.filter(proj => proj.name.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, projects]);

    const isAdmin = userRoles.includes('ADMIN');
    const isProjectManager = userRoles.includes('PROJECT_MANAGER');

    const deleteSelectedProjects = () => {
        console.log("Deleting projects with IDs:", selectedProjects);
    
        const deletePromises = selectedProjects.map(id => {
            return ProjectDataService.deleteProject(id);
        });
    
        Promise.all(deletePromises)
            .then(() => {
                const remainingProjects = projects.filter(proj => !selectedProjects.includes(proj.id));
                setProjects(remainingProjects);
                setSelectedProjects([]);
                setSnackbarMessage("Deleted selected projects successfully!");
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
            })
            .catch(error => {
                console.error('Error deleting projects:', error);
                setSnackbarMessage("Failed to delete selected projects!");
                setSnackbarSeverity('error'); 
                setOpenSnackbar(true);
            });
    };
    
    const refreshProjects = () => {
        ProjectDataService.retrieveAllProjects()
            .then(response => {
                const transformedData = transformProjectData(response.data);
                setProjects(transformedData);
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
                setSnackbarMessage("Failed to retrieve data: You need login");
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };

    const transformProjectData = (projects) => {
        return projects.map(proj => ({
            ...proj,
            employees: proj.employees.map(emp => emp.name).join(", ") 
        }));
    };
    
    const addProjectClicked = () => {
        navigate('/projects/-1');
    };

    const confirmDeleteProject = () => {
        if (projectToDelete) {
            ProjectDataService.deleteProject(projectToDelete.id)
                .then(() => {
                    setOpenDialog(false);
                    refreshProjects();
                    setSnackbarMessage(`Project ${projectToDelete.name} deleted successfully!`);
                    setSnackbarSeverity('success');
                    setOpenSnackbar(true);
                })
                .catch(error => {
                    console.error('Error deleting project:', error);
                    setSnackbarMessage(`Failed to delete project ${projectToDelete.name}!`);
                    setSnackbarSeverity('error'); 
                    setOpenSnackbar(true);
                });
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 150, editable: false },
        { field: 'description', headerName: 'Description', width: 200, editable: false },
        { field: 'employees', headerName: 'Employees', width: 200, editable: false },
        {
          field: 'actions',
          headerName: 'Actions',
          sortable: false,
          width: 300,
          renderCell: (params) => (
            <>
              <Button 
                  variant="contained" 
                  color="primary" 
                  style={{ marginRight: 8}}
                  onClick={() => navigate(`/projects/${params.id}`)}
                  disabled={!isAdmin && !isProjectManager}
              >
                  Update
              </Button>
              <Button 
                  variant="contained" 
                  color="secondary" 
                  style={{ marginRight: 8}}
                  onClick={() => {
                      setProjectToDelete(params.row);
                      setOpenDialog(true);
                  }}
                  disabled={!isAdmin && !isProjectManager}
              >
                  Delete
              </Button>
              <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => navigate(`/projects/${params.id}/details`)}
              >
                  Detail
              </Button>
            </>
          ),
        },
      ];
      
    return (
        <Box sx={{ padding: '20px 80px' }}>
            <Box sx={{height: 600  }}>
                <TextField
                    label="Search Projects By Name"
                    variant="outlined"
                    fullWidth
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                    style={{ marginBottom: '20px' }}
                />
                <DataGrid
                    rows={filteredProjects}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    disableSelectionOnClick
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                        setSelectedProjects(newRowSelectionModel);
                      }}
                    rowSelectionModel={selectedProjects}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 12, gap: '20px' }}>
                <Button variant="contained" color="primary" onClick={addProjectClicked} disabled={!isAdmin && !isProjectManager}>
                    Add Project
                </Button>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => setOpenBulkDeleteDialog(true)}
                    disabled={selectedProjects.length === 0 || (!isAdmin && !isProjectManager)} 
                >
                    Bulk Delete
                </Button>
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete {projectToDelete?.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={confirmDeleteProject} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openBulkDeleteDialog}
                onClose={() => setOpenBulkDeleteDialog(false)}
                aria-labelledby="bulk-delete-dialog-title"
                aria-describedby="bulk-delete-dialog-description"
            >
                <DialogTitle id="bulk-delete-dialog-title">{"Confirm Bulk Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="bulk-delete-dialog-description">
                        Are you sure you want to delete {selectedProjects.length} selected projects?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={() => {
                            deleteSelectedProjects();
                            setOpenBulkDeleteDialog(false);
                        }} 
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ListProjectsComponent;

