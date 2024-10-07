import React, { useState } from 'react';
import './App.css'
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';



// Mock data for employee lists
const appDevEmployees = [
  { id: 1, name: 'Monika Goyal Test' },
  { id: 2, name: 'Shaili Khatri' }
];

const bizAdminEmployees = [
  { id: 4, name: 'Gaurav' },
  { id: 5, name: 'Akshay' }
];

// JobID values based on role
const jobIdMapping = {
  "Application Development": "OWNAI_234",
  "Business Administrator": "CLK_12880"
};
// Client to role mapping
const clientRoleMapping = {
  "Collabera": "Application Development",
  "Tops": "Business Administrator"
};


const EmployeeList = () => {
  // State for PO type (individual or group)
  const [poType, setPoType] = useState('Individual PO'); // Default is Individual PO
  // State for multiple role sections (to add more when clicking "Add Another" for Group PO)
  const [roleSections, setRoleSections] = useState([{ id: 1, role: 'Application Development', showList: true, jobId: jobIdMapping['Application Development'] }]);
  // State for selected employees per section
  const [selectedEmployees, setSelectedEmployees] = useState({});
  // State to track input field values for each employee
  const [employeeInputValues, setEmployeeInputValues] = useState({});
  // State for selected client
  const [selectedClient, setSelectedClient] = useState("");
  // State for "view" or "edit" mode
  const [isViewMode, setIsViewMode] = useState(false);




  // Handle PO type change
  const handlePoTypeChange = (e) => {
    setPoType(e.target.value);
    setSelectedEmployees({});
    setRoleSections([{ id: 1, role: 'Application Development', showList: true, jobId: jobIdMapping['Application Development'] }]);
  };

  // Handle client selection
  const handleClientChange = (e) => {
    const client = e.target.value;
    setSelectedClient(client);
    if (clientRoleMapping[client]) {
      const newRole = clientRoleMapping[client];
      setRoleSections(
        roleSections.map((section, index) =>
          index === 0 ? {
            ...section,
            role: newRole,
            jobId: jobIdMapping[newRole] // Auto-fill JobID based on role
          } : section
        )
      );
      setSelectedEmployees({ 1: [] }); // Reset selections for first section
      setEmployeeInputValues({ 1: {} }); // Reset input fields for first section
    }
  };
  // Handle role change in a specific section
  const handleRoleChange = (sectionId, newRole) => {
    setRoleSections(
      roleSections.map(section =>
        section.id === sectionId ? {
          ...section,
          role: newRole,
          jobId: jobIdMapping[newRole] // Auto-fill JobID when role changes
        } : section
      )
    );
    setSelectedEmployees(prevState => ({ ...prevState, [sectionId]: [] })); // Reset employee selection for that section
    setEmployeeInputValues(prevState => ({ ...prevState, [sectionId]: {} })); // Reset input values for that section
  };


  // Get employee list based on role
  const getEmployeeList = (role) => {
    if (role === 'Business Administrator') {
      return bizAdminEmployees;
    }
    return appDevEmployees;
  };


  // Handle employee selection (checkbox) in a specific section
  const handleCheckboxChange = (sectionId, employeeId) => {
    if (poType === 'Individual PO') {
      // Only one employee can be selected for Individual PO
      if (selectedEmployees[sectionId]?.includes(employeeId)) {
        // If employee is already selected, unselect and reset the input fields
        setSelectedEmployees({ [sectionId]: [] });
        setEmployeeInputValues(prevState => ({
          ...prevState,
          [sectionId]: {
            ...prevState[sectionId],
            [employeeId]: ['', '', '', '', '', '', ''] // Reset all input fields to empty
          }
        }));
      } else {
        // Select the clicked employee, disable others
        setSelectedEmployees({ [sectionId]: [employeeId] });
      }
    } else {
      // For Group PO, allow multiple employees to be selected
      setSelectedEmployees(prevState => {
        const currentSelected = prevState[sectionId] || [];
        if (currentSelected.includes(employeeId)) {
          // Deselect employee if already selected and reset their input values
          return {
            ...prevState,
            [sectionId]: currentSelected.filter(id => id !== employeeId)
          };
        } else {
          // Select employee
          return {
            ...prevState,
            [sectionId]: [...currentSelected, employeeId]
          };
        }
      });
      // Reset input values when deselecting an employee in Group PO
      setEmployeeInputValues(prevState => ({
        ...prevState,
        [sectionId]: {
          ...prevState[sectionId],
          [employeeId]: ['', '', '', '', '', '', ''] // Reset all input fields to empty
        }
      }));
    }
  };
  // Handle input value change for an employee's specific input field
  const handleInputChange = (sectionId, employeeId, fieldIndex, value) => {
    setEmployeeInputValues(prevState => ({
      ...prevState,
      [sectionId]: {
        ...prevState[sectionId],
        [employeeId]: prevState[sectionId]?.[employeeId]?.map((val, idx) =>
          idx === fieldIndex ? value : val
        ) || ['', '', '', '', '', '', '']
      }
    }));
  };

  // Add another role section when "Add Another" button is clicked (only for Group PO)
  const handleAddAnother = () => {
    setRoleSections([...roleSections, { id: roleSections.length + 1, role: 'Application Development', showList: false, jobId: jobIdMapping['Application Development'] }]);
  };

  // Toggle the visibility of the employee list for a specific section
  const toggleEmployeeList = (sectionId) => {
    setRoleSections(
      roleSections.map(section =>
        section.id === sectionId ? { ...section, showList: !section.showList } : section
      )
    );
  };
  // Delete a role section
  const handleDeleteSection = (sectionId) => {
    setRoleSections(roleSections.filter(section => section.id !== sectionId));
    setSelectedEmployees(prevState => {
      const updatedSelected = { ...prevState };
      delete updatedSelected[sectionId]; // Remove the employee selections for the deleted section
      return updatedSelected;
    });
    setEmployeeInputValues(prevState => {
      const updatedInputs = { ...prevState };
      delete updatedInputs[sectionId]; // Remove the input values for the deleted section
      return updatedInputs;
    });
  };

  // Reset the entire form
  const handleReset = () => {
    setSelectedClient(""); // Reset client
    setPoType("Individual PO"); // Reset PO type
    setRoleSections([{ id: 1, role: 'Application Development', showList: true, jobId: jobIdMapping['Application Development'] }]); // Reset role sections
    setSelectedEmployees({}); // Reset selected employees
    setEmployeeInputValues({}); // Reset input field values
    setIsViewMode(false); // Switch back to edit mode
    reset();
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  // Watch startDate and endDate from the form
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = (data) => {
    setIsViewMode(true);
    console.log(data)
  }
  return (
    <>
      {/* Client details  */}
      <form className="row gy-2 gx-3 align-items-center ms-1" onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          <div className="col-sm-12 col-md-3 col-lg-3">
            <label for="ClientName">Client Name</label>
            {/* Client Selection */}
            <select className="form-select" id='ClientName' value={selectedClient} onChange={handleClientChange}  disabled={isViewMode}>
              <option value="Collabera">Collabera - Collabera Inc</option>
              <option value="Tops">Tops</option>
            </select>
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            {/* PO Type Selection */}
            <label for="PurchaseOrderType">Purchase Order Type</label>
            <select value={poType} id='PurchaseOrderType' onChange={handlePoTypeChange} className="form-select"  disabled={isViewMode}>
              <option value="Individual PO">Individual PO</option>
              <option value="Group PO">Group PO</option>
            </select>
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            <label for="PurchaseOrderNo">Purchase Order No</label>
            <input type="text" className="form-control" id='PurchaseOrderNo' placeholder='PO Number' {...register("ponumber", { required: { value: true, message: "This field is required" } })} required disabled={isViewMode} />
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            <label for="ReceivedOn">Received On</label>
            <input type="date" className="form-control" id='ReceivedOn' placeholder="Received On" {...register("receivedon", { required: { value: true, message: "This field is required" } })} required disabled={isViewMode} />
          </div>
        </div>


        <div className="row g-3">
          <div className="col-lg-3 col-md-6">
            <label for="ReceivedFrom">Received From</label>
            <input type="text" className="form-control" id='ReceivedFrom' placeholder="Received From Name" {...register("receivedfrom", { required: { value: true, message: "This field is required" } })} required disabled={isViewMode} />
          </div>
          <div className="col-lg-3 col-md-6">
            <label for="ReceivedFromEmailID"></label>
            <input type="email" className="form-control" pattern="[^@\s]+@[^@\s]+\.[^@\s]+" id='ReceivedFromEmailID' placeholder="Received From Email ID" {...register("receivedfromemail", { required: { value: true, message: "This field is required" } })} required disabled={isViewMode} />
          </div>
          <div className="col-lg col-md">
            <label for="POStartDate">PO Start Date</label>
            <Controller

              name="startDate"
              control={control}
              rules={{ required: 'Start date is required' }}
              render={({ field }) => (
                <DatePicker
                  id='POStartDate'
                  className='form-control'
                  placeholderText="Start date"
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  disabled={isViewMode}
                  required
                />
              )}
            />
            {errors.startDate && <p style={{ color: 'red' }}>{errors.startDate.message}</p>}
          </div>
          <div className="col-lg col-md">
            <label for="POEndDate">PO End Date</label>
            <Controller
              name="endDate"
              control={control}
              rules={{
                required: 'End date is required',
                validate: value => value >= startDate || 'End date cannot be before the start date',
              }}
              render={({ field }) => (
                <DatePicker
                  id='POEndDate'
                  className='form-control'
                  placeholderText="End date"
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    // handleEndDateChange(date);
                  }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate} // Prevent selecting end date before start date
                  disabled={isViewMode}
                  required
                />
              )}
            />
            {errors.endDate && <p style={{ color: 'red' }}>{errors.endDate.message}</p>}
          </div>
          <div className="col-lg col-md">
            <label for="Budget">Budget</label>
            <input type="telNo" className="form-control" id='Budget' name="quantity" placeholder="Budget" required maxlength="5" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" {...register("budget", { required: { value: true, message: "This field is required" } })} disabled={isViewMode} />
          </div>
          <div className="col-lg col-md">
            <label for="Currency0">Currency</label>
            <select className="form-select" id='Currency' disabled={isViewMode} {...register("currency0", { required: { value: true, message: "This field is required" } })}>
              <option value='dollar'>USD-Dollars($)</option>
              <option value='rupee'>IN-India(&#8377;)</option>
              <option value='euro'>Euro(&#x20AC;)</option>
              <option value='pound'>Pound(&#xa3;)</option>
            </select>
          </div>
        </div>
        <br />
        <div className='d-flex justify-content-between bg-body-tertiary px-3'>
          <h2>Talent Details</h2>
          {/* "Add Another" button for Group PO */}
          {poType === 'Group PO' && !isViewMode && (
            <div className='btn border-dark rounded-pill' id='add' onClick={handleAddAnother}>
              + ADD Another
            </div>
          )}
        </div>
        {/* <div className='bg-body-tertiary p-3'> */}
        {/* Role Sections (dynamically added in Group PO) */}
        {roleSections.map((section, index) => (

          <div key={section.id} >
            {/* <div className='d-flex row'> */}
            {/* Role Selection */}
            <div className='row gx-3 gy-2 align-items-center d-flex mb-3 border-bottom pb-3 justify-content-between'>
              <div className='col-sm-12 col-md-6 col-lg-3 d-flex'>
                <div className='col-lg-12 px-3'>
                  <label for="JobTitle/REQName">Job Title/REQ Name</label>
                  <select className="form-select" id='JobTitle/REQName'
                    value={section.role}
                    onChange={(e) => handleRoleChange(section.id, e.target.value)}
                    disabled={isViewMode}
                  
                  >
                    <option value="Application Development">Application Development</option>
                    <option value="Business Administrator">Business Administrator</option>
                  </select>
                </div>
                {/* Auto-fill JobID */}
                <div className='col-lg-12'>
                  <label for='JobID'>JobID :</label>
                  <input
                    id='JobID'
                    className='form-control'
                    type="text"
                    value={section.jobId}
                    // readOnly
                    disabled
                  />
                </div>
              </div>
              <div className='col-auto ms-auto d-flex align-items-center'>
                {/* Delete button to remove the role section */}
                <div className='col-auto'>
                  <button
                    className='btn trash'
                    onClick={() => handleDeleteSection(section.id)}
                    disabled={roleSections.length === 1 || index === 0 || isViewMode} // Disable Delete button for the first section and when only one section exists
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
                {/* Toggle button to show/hide employee list */}

                <div className='col-auto'>
                  <div
                    className='btn btn-outline-tertiary '
                    onClick={() => toggleEmployeeList(section.id)} disabled={isViewMode}>
                    {section.showList ? <i class="bi bi-dash-lg"></i> : <i class="bi bi-plus-lg"></i>}
                  </div>
                </div>
              </div>
            </div>


            {/* </div> */}
            {/* Employee List (only shown when "Add" button is clicked) */}
            {section.showList && (
              <>
                {/* <h3>Employee List for {section.role}</h3> */}
                <div className=''>
                  {getEmployeeList(section.role).map(employee => (
                    <div key={employee.id}>
                      <div>
                        <input
                          className=''
                          type="checkbox"
                          checked={(selectedEmployees[section.id] || []).includes(employee.id)}
                          disabled={
                            isViewMode ||
                            poType === 'Individual PO' &&
                            (selectedEmployees[section.id]?.length > 0 &&
                              !selectedEmployees[section.id].includes(employee.id))
                          }
                          onChange={() => handleCheckboxChange(section.id, employee.id)}
                          required
                        />
                        <b> {employee.name}</b>
                      </div>
                      <div className='row gx-3 gy-2 align-items-center'>
                        {/* Input field for employee, enabled only if checkbox is selected */}
                        <div className='col-sm-12 col-md-6 col-lg-3 mb-3'>
                          <label for="contractduration">Contract Duration</label>
                          <input
                            id='contractduration'
                            className='form-control'
                            type="number"
                            value={employeeInputValues[section.id]?.[employee.id]?.[0] || ''}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}
                            onChange={(e) => handleInputChange(section.id, employee.id, 0, e.target.value)}
                            placeholder="Contract Duration in Months"
                            required
                          />
                        </div>
                        <div className='col-sm-12 col-md-6 col-lg mb-3'>
                          <label for="billrate">Bill Rate</label>
                          <input
                            id='billrate'
                            className='form-control'
                            type="number"
                            value={employeeInputValues[section.id]?.[employee.id]?.[1] || ''}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}
                            onChange={(e) => handleInputChange(section.id, employee.id, 1, e.target.value)}
                            required
                            placeholder="Bill Rate in /hr"
                          />
                        </div>
                        <div className='col-sm-12 col-md-6 col-lg mb-3'>
                          <label for="currency">Currency</label>
                          <select
                            className="form-select"
                            id='currency'
                            value={employeeInputValues[section.id]?.[employee.id]?.[2] || ''}
                            onChange={(e) => handleInputChange(section.id, employee.id, 2, e.target.value)}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}>
                            <option value='dollar'>USD-Dollars($)</option>
                            <option value='rupee'>IN-India(&#8377;)</option>
                            <option value='euro'>Euro(&#x20AC;)</option>
                            <option value='pound'>Pound(&#xa3;)</option>
                          </select>
                        </div>
                        <div className='col-sm-12 col-md-6 col-lg mb-3'>
                          <label for="standardtimebr">Standard Time BR</label>
                          <input
                            id='standardtimebr'
                            className='form-control'
                            type="number"
                            value={employeeInputValues[section.id]?.[employee.id]?.[3] || ''}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}
                            onChange={(e) => handleInputChange(section.id, employee.id, 3, e.target.value)}
                            placeholder="Std. Time BR in /hr"
                            required
                          />
                        </div>
                        <div className='col-sm-12 col-md-6 col-lg mb-3'>
                          <label for="currency2">Currency</label>
                          <select
                            id='currency2'
                            className="form-select"
                            value={employeeInputValues[section.id]?.[employee.id]?.[4] || ''}
                            onChange={(e) => handleInputChange(section.id, employee.id, 4, e.target.value)}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}>
                            <option value='dollar'>USD-Dollars($)</option>
                            <option value='rupee'>IN-India(&#8377;)</option>
                            <option value='euro'>Euro(&#x20AC;)</option>
                            <option value='pound'>Pound(&#xa3;)</option>
                          </select>
                        </div>
                        <div className='col-sm-12 col-md-6 col-lg mb-3'>
                          <label for="overtimebr">Over Time BR</label>
                          <input
                            id='overtimebr'
                            className='form-control'
                            type="number"
                            value={employeeInputValues[section.id]?.[employee.id]?.[5] || ''}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}
                            onChange={(e) => handleInputChange(section.id, employee.id, 5, e.target.value)}
                            placeholder="Over Time BR in /hr"
                            required
                          />
                        </div>
                        <div className='col-sm-12 col-md-6 col-lg mb-3'>
                          <label for="currency3">Currency</label>
                          <select
                            id='currency3'
                            className="form-select"
                            value={employeeInputValues[section.id]?.[employee.id]?.[6] || ''}
                            onChange={(e) => handleInputChange(section.id, employee.id, 6, e.target.value)}
                            disabled={!selectedEmployees[section.id]?.includes(employee.id) || isViewMode}>
                            <option value='dollar'>USD-Dollars($)</option>
                            <option value='rupee'>IN-India(&#8377;)</option>
                            <option value='euro'>Euro(&#x20AC;)</option>
                            <option value='pound'>Pound(&#xa3;)</option>
                          </select>
                        </div>
                      </div>
                      <br />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        ))}
        {/* </div> */}
        <div className='p-3 d-flex justify-content-end'>
        <button onClick={handleReset} className='btn btn-outline-dark mx-1'>Reset</button>
        <input type="submit" value="submit" className='btn btn-outline-dark mx-1' disabled={isViewMode}/>
        </div>
      </form>

    </>
  )
}

export default EmployeeList
