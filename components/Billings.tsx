'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';

const medicalProcedures = [
  { name: "Basic metabolic panel", cptCode: "80048" },
  { name: "Blood test, comprehensive group of blood chemicals", cptCode: "80053" },
  { name: "Obstetric blood test panel", cptCode: "80055" },
  { name: "Blood test, lipids (cholesterol and triglycerides)", cptCode: "80061" },
  { name: "Kidney function panel test", cptCode: "80069" },
  { name: "Liver function blood test panel", cptCode: "80076" },
  { name: "Manual urinalysis test with examination using microscope", cptCode: "81000" },
  { name: "Automated urinalysis test", cptCode: "81002 or 81003" },
  { name: "PSA (prostate specific antigen)", cptCode: "84153-84154" },
  { name: "Blood test, thyroid stimulating hormone (TSH)", cptCode: "84443" },
  { name: "Complete blood cell count, with differential white blood cells, automated", cptCode: "85025" },
  { name: "Complete blood count, automated", cptCode: "85027" },
  { name: "Blood test, clotting time", cptCode: "85610" },
  { name: "Coagulation assessment blood test", cptCode: "85730" },
  { name: "CT scan, head or brain, without contrast", cptCode: "70450" },
  { name: "MRI scan of brain before and after contrast", cptCode: "70553" },
  { name: "X-Ray, lower back, minimum four views", cptCode: "72110" },
  { name: "MRI scan of lower spinal canal", cptCode: "72148" },
  { name: "CT scan, pelvis, with contrast", cptCode: "72193" },
  { name: "MRI scan of leg joint", cptCode: "73721" },
  { name: "CT scan of abdomen and pelvis with contrast", cptCode: "74177" },
  { name: "Ultrasound of abdomen", cptCode: "76700" },
  { name: "Abdominal ultrasound of pregnant uterus (greater or equal to 14 weeks 0 days) single or first fetus", cptCode: "76805" },
  { name: "Ultrasound pelvis through vagina", cptCode: "76830" },
  { name: "Mammography of one breast", cptCode: "77065" },
  { name: "Mammography of both breasts", cptCode: "77066" },
  { name: "Mammography, screening, bilateral", cptCode: "77067" },
  { name: "Cardiac valve and other major cardiothoracic procedures with cardiac catheterization with major complications or comorbidities", cptCode: "216" },
  { name: "Spinal fusion except cervical without major comorbid conditions or complications (MCC)", cptCode: "460" },
  { name: "Major joint replacement or reattachment of lower extremity without major comorbid conditions or complications (MCC)", cptCode: "470" },
  { name: "Cervical spinal fusion without comorbid conditions (CC) or major comorbid conditions or complications (MCC)", cptCode: "473" },
  { name: "Uterine and adnexa procedures for non-malignancy without comorbid conditions (CC) or major comorbid conditions or complications (MCC)", cptCode: "743" },
  { name: "Removal of 1 or more breast growth, open procedure", cptCode: "19120" },
  { name: "Shaving of shoulder bone using an endoscope", cptCode: "29826" },
  { name: "Removal of one knee cartilage using an endoscope", cptCode: "29881" },
  { name: "Removal of tonsils and adenoid glands patient younger than age 12", cptCode: "42820" },
  { name: "Diagnostic examination of esophagus, stomach, and/or upper small bowel using an endoscope", cptCode: "43235" },
  { name: "Biopsy of the esophagus, stomach, and/or upper small bowel using an endoscope", cptCode: "43239" },
  { name: "Diagnostic examination of large bowel using an endoscope", cptCode: "45378" },
  { name: "Biopsy of large bowel using an endoscope", cptCode: "45380" },
  { name: "Removal of polyps or growths of large bowel using an endoscope", cptCode: "45385" },
  { name: "Ultrasound examination of lower large bowel using an endoscope", cptCode: "45391" },
  { name: "Removal of gallbladder using an endoscope", cptCode: "47562" },
  { name: "Repair of groin hernia patient age 5 years or older", cptCode: "49505" },
  { name: "Biopsy of prostate gland", cptCode: "55700" },
  { name: "Surgical removal of prostate and surrounding lymph nodes using an endoscope", cptCode: "55866" },
  { name: "Routine obstetric care for vaginal delivery, including pre-and post-delivery care", cptCode: "59400" },
  { name: "Routine obstetric care for cesarean delivery, including pre-and post-delivery care", cptCode: "59510" },
  { name: "Routine obstetric care for vaginal delivery after prior cesarean delivery including pre-and post-delivery care", cptCode: "59610" },
  { name: "Injection of substance into spinal canal of lower back or sacrum using imaging guidance", cptCode: "62322" },
  { name: "Injections of anesthetic and/or steroid drug into lower or sacral spine nerve root using imaging guidance", cptCode: "64483" },
  { name: "Removal of recurring cataract in lens capsule using laser", cptCode: "66821" },
  { name: "Removal of cataract with insertion of lens", cptCode: "66984" },
  { name: "Electrocardiogram, routine, with interpretation and report", cptCode: "93000" },
  { name: "Insertion of catheter into left heart for diagnosis", cptCode: "93452" },
  { name: "Sleep study", cptCode: "95810" },
  { name: "Physical therapy, therapeutic exercise", cptCode: "97110" }
];

function Billings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [zipCode, setZipCode] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fuse = new Fuse(medicalProcedures, {
    keys: ['name', 'cptCode'],
    threshold: 0.3,
  });

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!selectedProcedure) {
      setError('Please select a medical procedure');
      return;
    }
    setLoading(true);
    setError('');
    setHospitals([]);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_cigna_hospitals`,
        {
          billing_code: selectedProcedure.cptCode,
          zip_code: zipCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      );
      setHospitals(response.data);
    } catch (err) {
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcedureSelect = (procedure: { name: any; cptCode: any; }) => {
    setSelectedProcedure(procedure);
    setSearchTerm(`${procedure.name} (${procedure.cptCode})`);
    setShowDropdown(false);
  };

  const filteredProcedures = searchTerm
    ? fuse.search(searchTerm).map((result: { item: any; }) => result.item)
    : medicalProcedures;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12">
      <div className="w-full max-w-md px-8">
        <div className="bg-gray-800 shadow-lg rounded-3xl p-8 space-y-6">
          <h1 className="text-3xl font-semibold text-center text-teal-300">Cigna Price Transparency App</h1>
          <form onSubmit={handleSearch}>
            <div className="mb-4 relative">
              <label htmlFor="procedureSearch" className="block text-teal-300 text-sm font-bold mb-2">
                Medical Procedure or CPT Code
              </label>
              <input
                type="text"
                id="procedureSearch"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  setSelectedProcedure(null);
                }}
                onFocus={() => setShowDropdown(true)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search by procedure name or CPT code"
                required
              />
              {showDropdown && (
                <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 mt-1 max-h-60 overflow-auto">
                  {filteredProcedures.map((procedure: { name: any; cptCode: any; }, index: React.Key | null | undefined) => (
                    <li
                      key={index}
                      onClick={() => handleProcedureSelect(procedure)}
                      className="cursor-pointer hover:bg-gray-600 p-2"
                    >
                      {procedure.name} ({procedure.cptCode})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="zipCode" className="block text-teal-300 text-sm font-bold mb-2">
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {hospitals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-center">Results</h2>
              <ul className="space-y-4">
                {hospitals.map((hospital: any, index) => (
                  <li key={index} className="border-b pb-4">
                    <p className="font-semibold">{hospital.organization_name}</p>
                    <p>{hospital.address_line_1}</p>
                    <p>{hospital.city}, {hospital.state}</p>
                    <p className="text-green-400 font-semibold">${parseFloat(hospital.negotiated_rate).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Billings;