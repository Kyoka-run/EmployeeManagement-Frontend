import React, { useState, useEffect } from 'react';
import EmployeeDataService from '../service/EmployeeDataService';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, TextField, InputAdornment } from '@mui/material';

const ListEmployeesComponent = () => {
    const [employees, setEmployees] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setSnackbarMessage(location.state.message);
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            // Clear state information
            navigate(location.pathname, { replace: true, state: {} });
        }
        refreshEmployees();
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        setFilteredEmployees(
            employees.filter(emp => emp.name.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, employees]);

    const deleteSelectedEmployees = () => {
        console.log("Deleting employees with IDs:", selectedEmployees);
    
        const deletePromises = selectedEmployees.map(id => {
            return EmployeeDataService.deleteEmployee(id);
        });
    
        Promise.all(deletePromises)
            .then(() => {
                const remainingEmployees = employees.filter(emp => !selectedEmployees.includes(emp.id));
                setEmployees(remainingEmployees);
                setSelectedEmployees([]);
                setSnackbarMessage("Deleted selected employees successfully!");
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
            })
            .catch(error => {
                console.error('Error deleting employees:', error);
                setSnackbarMessage("Failed to delete selected employees!");
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };
    
    const refreshEmployees = () => {
        EmployeeDataService.retrieveAllEmployees()
            .then(response => {
                const transformedData = transformEmployeeData(response.data);
                setEmployees(transformedData);
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
                setSnackbarMessage("Failed to retrieve data: You need login");
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };

    const transformEmployeeData = (employees) => {
        return employees.map(emp => ({
            ...emp,
            projects: emp.projects.map(p => p.name).join(", ") 
        }));
    };
    
    const addEmployeeClicked = () => {
        navigate('/employees/-1');
    };

    const confirmDeleteEmployee = () => {
        if (employeeToDelete) {
            EmployeeDataService.deleteEmployee(employeeToDelete.id)
                .then(() => {
                    setOpenDialog(false);
                    refreshEmployees();
                    setSnackbarMessage(`Employee ${employeeToDelete.name} deleted successfully!`);
                    setSnackbarSeverity('success'); 
                    setOpenSnackbar(true);
                })
                .catch(error => {
                    console.error('Error deleting employee:', error);
                    setSnackbarMessage(`Failed to delete employee ${employeeToDelete.name}!`);
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
        { field: 'position', headerName: 'Position', width: 150, editable: false },
        { field: 'department', headerName: 'Department', width: 130, editable: false },
        { field: 'email', headerName: 'Email', width: 200, editable: false },
        { field: 'projects', headerName: 'Projects', width: 200, editable: false },
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
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/employees/${params.id}`)}
              >
                  Update
              </Button>
              <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={() => {
                      setEmployeeToDelete(params.row);
                      setOpenDialog(true);
                  }}
              >
                  Delete
              </Button>
            </>
          ),
        },
      ];
      
      return (
        <Box sx={{ padding: '20px 80px' }}>
            <Box sx={{height: 600  }}>
                <TextField
                    label="Search Employees By Name"
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
                    rows={filteredEmployees}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    disableSelectionOnClick
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                        setSelectedEmployees(newRowSelectionModel);
                      }}
                    rowSelectionModel={selectedEmployees}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 12, gap: '20px' }}>
                <Button variant="contained" color="primary" onClick={addEmployeeClicked}>
                    Add Employee
                </Button>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {
                        setOpenBulkDeleteDialog(true);
                    }}
                    disabled={selectedEmployees.length === 0} 
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
                        Are you sure you want to delete {employeeToDelete?.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={confirmDeleteEmployee} autoFocus>
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
                            Are you sure you want to delete {selectedEmployees.length} selected employees?  
                        </DialogContentText>
                    </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={() => {
                        deleteSelectedEmployees();
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

export default ListEmployeesComponent;