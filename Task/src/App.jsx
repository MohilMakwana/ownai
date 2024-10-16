import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PurchaseOrderForm = () => {
  const [clientName, setClientName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [receivedOn, setReceivedOn] = useState(null);
  const [receivedFromName, setReceivedFromName] = useState("");
  const [receivedFromEmail, setReceivedFromEmail] = useState("");
  const [poStartDate, setPoStartDate] = useState(null);
  const [poEndDate, setPoEndDate] = useState(null);
  const [budget, setBudget] = useState("");
  const [poType, setPoType] = useState('');
  const [curr, setCurr] = useState("");
  const [reqSections, setReqSections] = useState([{ id: 1, jobTitle: '', employees: [] }]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const clients = ['Collabera', 'Tops'];
  const poTypes = ['Group PO', 'Individual PO'];
  const currencies = ['USA', 'Russia', 'India'];
  // const talentOptions = ['Application Development', 'Business Development'];



  const jobTitles = {
    'Application Development': ['Monika Goyal', 'Shaili Khatri'],
    'Business Administrator': ['John Doe', 'Jane Smith']
  };

  const handlePoTypeChange = (e) => {
    setPoType(e.target.value);
  };

  const addReqSection = () => {
    setReqSections([...reqSections, { id: reqSections.length + 1, jobTitle: '', employees: [] }]);
  };

  const deleteReqSection = (id) => {
    if (reqSections.length > 1) {
      setReqSections(reqSections.filter(section => section.id !== id));
    }
  };

  const toggleReqSection = (id) => {
    setReqSections(reqSections.map(section =>
      section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const handleJobTitleChange = (id, value) => {
    setReqSections(reqSections.map(section =>
      section.id === id ? {
        ...section,
        jobTitle: value,
        employees: jobTitles[value].map(name => ({
          name,
          selected: false,
          contractDuration: '',
          billRate: '',
          currency1: '',
          standardTimeBR: '',
          currency2: '',
          overTimeBR: '',
          currency3: ''
        }))
      } : section
    ));
  };

  const toggleEmployee = (sectionId, employeeName) => {
    setReqSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.id === sectionId) {
          const updatedEmployees = section.employees.map(emp => {
            if (emp.name === employeeName) {
              return { ...emp, selected: !emp.selected };
            }
            return emp;
          });

          // For Individual PO, deselect other employees if one is selected
          if (poType === 'Individual PO') {
            const selectedEmployee = updatedEmployees.find(emp => emp.selected);
            if (selectedEmployee) {
              updatedEmployees.forEach(emp => {
                if (emp.name !== selectedEmployee.name) {
                  emp.selected = false;
                }
              });
            }
          }

          return { ...section, employees: updatedEmployees };
        }
        return section;
      });

      return updatedSections;
    });
  };

  const handleEmployeeInputChange = (sectionId, employeeName, field, value) => {
    setReqSections(reqSections.map(section =>
      section.id === sectionId ? {
        ...section,
        employees: section.employees.map(emp =>
          emp.name === employeeName ? { ...emp, [field]: value } : emp
        )
      } : section
    ));
  };


  const handleSave = (e) => {
    e.preventDefault();
    let isValid = true;
    let errorMessage = '';
    if (poType === 'Individual PO') {
      const selectedEmployees = reqSections[0].employees.filter(emp => emp.selected);
      if (selectedEmployees.length !== 1) {
        isValid = false;
        errorMessage = 'For Individual PO, you must select exactly one employee.';
      }
    } else if (poType === 'Group PO') {
      const totalSelectedEmployees = reqSections.reduce((total, section) =>
        total + section.employees.filter(emp => emp.selected).length, 0);
      if (totalSelectedEmployees < 2) {
        isValid = false;
        errorMessage = 'For Group PO, you must select at least two employees.';
      }
    }

    if (!isValid) {
      alert(errorMessage);
      return;
    }
    const formData = {
      clientName,
      poType,
      poNumber,
      receivedOn,
      receivedFromName,
      receivedFromEmail,
      poStartDate,
      poEndDate,
      budget,
      curr,
      reqSections,
    };
    console.log('Form Data:', formData);
    setIsSubmitted(true);
    setIsReadOnly(true);
  };
  const handleReset = () => {
    setClientName('');
    setPoType('');
    setPoNumber('');
    setReceivedOn(null);
    setReceivedFromName('');
    setReceivedFromEmail('');
    setPoStartDate(null);
    setPoEndDate(null);
    setBudget('');
    setCurr('');
    setReqSections([{ id: 1, jobTitle: '', employees: [] }]);
    setIsSubmitted(false);
    setIsReadOnly(false);
  };


  return (
    <>
      <form onSubmit={handleSave} className='m-2'>
        <div className="row gy-2 gx-0 align-items-center ms-1">
          <div className="row g-3">
            <div className="col-sm-12 col-md-3 col-lg-3">
              <label>Client Name</label>
              <select className="form-select" value={clientName} onChange={(e) => setClientName(e.target.value)} required disabled={isReadOnly}>
                <option value="">Select</option>
                {clients.map((client) => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
            <div className="col-sm-12 col-md-3 col-lg-3">
              <label>Purchase Order Type</label>
              <select value={poType} className="form-select" onChange={handlePoTypeChange} required disabled={isReadOnly} >
                <option value="">Select</option>
                {poTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-sm-12 col-md-3 col-lg-3">
              <label htmlFor="">Purchase Order Number</label>
              <input className="form-control" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} type="text" placeholder='PO Number' required disabled={isReadOnly} />
            </div>
            <div className="col-sm-12 col-md-3 col-lg-3">
              <label htmlFor="">Received On </label>
              <DatePicker
                className='form-control'
                selected={receivedOn}
                onChange={(date) => setReceivedOn(date)}
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <label htmlFor="">Received From</label>
              <input type="text" className="form-control" value={receivedFromName} onChange={(e) => setReceivedFromName(e.target.value)} placeholder='Received From Name' required disabled={isReadOnly} />
            </div>
            <div className="col-lg-3 col-md-6">
              <label htmlFor=""></label>
              <input type="email" className="form-control" value={receivedFromEmail} onChange={(e) => setReceivedFromEmail(e.target.value)} placeholder='Received From Emial ID' required disabled={isReadOnly} />
            </div>
            <div className="col-lg col-md">
              <label htmlFor="">PO Start Date</label>
              <DatePicker
                className='form-control'
                selected={poStartDate}
                onChange={(date) => setPoStartDate(date)}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="col-lg col-md">
              <label htmlFor="">PO End Date</label>
              <DatePicker
                className='form-control'
                selected={poEndDate}
                onChange={(date) => {
                  if (!poStartDate || date >= poStartDate) {
                    setPoEndDate(date);
                  } else {
                    alert('PO End Date cannot be before PO Start Date');
                  }
                }}
                required
                placeholder='PO End date'
                minDate={poStartDate}
                disabled={isReadOnly}
              />
            </div>
            <div className="col-lg col-md">
              <label htmlFor="">Budget</label>
              <input type="number" placeholder='Budget' max="99999" min="0" className="form-control" required value={budget} onChange={(e) => setBudget(e.target.value)} disabled={isReadOnly} />
            </div>
            <div className="col-lg col-md">
              <label htmlFor="">Currency</label>
              <select className="form-select" name="" id="" value={curr} onChange={(e) => setCurr(e.target.value)} required disabled={isReadOnly}>
                <option value="">Select</option>
                {currencies.map((curre) => (
                  <option key={curre} value={curre}>{curre}</option>
                ))}
              </select>
            </div>
          </div>


          <div className='d-flex justify-content-between bg-body-tertiary px-3'>
            <h2>Talent details</h2>

            {poType === 'Group PO' && !isReadOnly && (
              <div className='btn border-dark rounded-pill' onClick={addReqSection}>+ Add Another</div>
            )}
          </div>


          {reqSections.map((section) => (
            <div key={section.id} >
              <>
                <div className='row gx-3 gy-2 align-items-center d-flex mb-3 border-bottom pb-3 justify-content-between'>
                  <div className='col-sm-12 col-md-6 col-lg-3 d-flex'>
                    <div className='col-lg-12 px-3'>
                      <label>Job Title/REQ Name: </label>
                      <select
                        className="form-select"
                        value={section.jobTitle}
                        onChange={(e) => handleJobTitleChange(section.id, e.target.value)}
                        required
                        disabled={isReadOnly}
                      >
                        <option value="">Select</option>
                        <option value="Application Development">Application Development</option>
                        <option value="Business Administrator">Business Administrator</option>
                      </select>
                    </div>

                    <div className='col-lg-12'>
                      <label>REQ ID/JOB ID: </label>
                      <input
                        className="form-control"
                        type="text"
                        value={section.jobTitle === 'Application Development' ? 'OWNAI_234' : section.jobTitle === 'Business Administrator' ? 'CLK_12880' : ''}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className='col-auto ms-auto d-flex align-items-center'>
                    <div className='col-auto'>
                      <button
                        onClick={() => deleteReqSection(section.id)}
                        disabled={reqSections.length === 1 || isReadOnly}
                      >
                        <i class="bi bi-trash3"></i>
                      </button>
                    </div>
                    <div className='col-auto'>
                      <div
                        className='btn btn-outline-tertiary '
                        onClick={() => toggleReqSection(section.id)}>
                        {section.isExpanded ? <i class="bi bi-dash-lg"></i> : <i class="bi bi-plus-lg"></i>}
                      </div>
                    </div>
                  </div>
                </div>
                {section.isExpanded && section.employees.map(employee => (
                  <div key={employee.name} className='row m-2'>
                    <label>
                      <input
                        type="checkbox"
                        // required
                        checked={employee.selected}
                        onChange={() => toggleEmployee(section.id, employee.name)}
                        disabled={isReadOnly}
                      />
                      {employee.name}
                    </label>


                    <div className='row gx-3 gy-2 align-items-center'>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Contract Duration: </label>
                        <input
                          className='form-control'
                          type="number"
                          min='0'
                          max='99999'
                          value={employee.contractDuration}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'contractDuration', e.target.value)}
                          readOnly={!employee.selected || isReadOnly} required
                        />
                      </div>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Bill Rate</label>
                        <input
                          className='form-control'
                          type="number"
                          min='0'
                          max='99999'
                          value={employee.billRate}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'billRate', e.target.value)}
                          readOnly={!employee.selected || isReadOnly} required
                        />
                      </div>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Currency</label>
                        <select
                          className="form-select"
                          value={employee.currency1}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'currency1', e.target.value)}
                          disabled={isReadOnly} required
                        >
                          <option>USA</option>
                          <option>India</option>
                        </select>
                      </div>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Standard Time BR: </label>
                        <input
                          className='form-control'
                          type="number"
                          min='0'
                          max='99999'
                          value={employee.standardTimeBR}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'standardTimeBR', e.target.value)}
                          readOnly={!employee.selected || isReadOnly} required
                        />
                      </div>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Currency</label>
                        <select
                          className="form-select"
                          value={employee.currency2}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'currency2', e.target.value)}
                          disabled={isReadOnly} required
                        >
                          <option>USA</option>
                          <option>India</option>
                        </select>
                      </div>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Over Time BR: </label>
                        <input
                          className='form-control'
                          type="number"
                          min='0'
                          max='99999'
                          value={employee.overTimeBR}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'overTimeBR', e.target.value)}
                          readOnly={!employee.selected || isReadOnly} required
                        />
                      </div>
                      <div className='col-sm-12 col-md-6 col-lg-2 mb-3'>
                        <label>Currency</label>
                        <select
                          className="form-select"
                          value={employee.currency3}
                          onChange={(e) => handleEmployeeInputChange(section.id, employee.name, 'currency3', e.target.value)}
                          disabled={isReadOnly} required
                        >
                          <option>USA</option>
                          <option>India</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </>

            </div>
          ))}
        </div>

        {!isSubmitted && (
          <button
            type="submit"
            disabled={
              (poType === 'Individual PO' && reqSections[0].employees.filter(emp => emp.selected).length !== 1) ||
              (poType === 'Group PO' && reqSections.reduce((total, section) =>
                total + section.employees.filter(emp => emp.selected).length, 0) < 2)
            }
          >
            Save
          </button>
        )}
        <button type="button" onClick={handleReset}>Reset</button>


      </form>
    </>
  )
};

export default PurchaseOrderForm;
