const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mangodb url', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

const employeeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  dateOfBirth: { type: Date, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes

// Get all employees
app.get('/api/v1/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Get employee by ID
app.get('/api/v1/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee', error: error.message });
  }
});

// Create new employee
app.post('/api/v1/employees', async (req, res) => {
  const { employeeName, employeeEmail, dateOfBirth } = req.body;
  if (!employeeName || !employeeEmail || !dateOfBirth) {
    return res.status(400).json({ message: 'Name, email, and date of birth are required' });
  }

  const newEmployee = new Employee({ employeeName, employeeEmail, dateOfBirth });

  try {
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error saving employee:', error);
    res.status(500).json({ message: 'Error saving employee', error: error.message });
  }
});

// Update employee by ID
app.put('/api/v1/employees/:id', async (req, res) => {
  const { employeeName, employeeEmail, dateOfBirth } = req.body;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, { employeeName, employeeEmail, dateOfBirth }, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
});

// Delete employee by ID
app.delete('/api/v1/employees/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
