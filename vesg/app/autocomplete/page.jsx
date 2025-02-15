"use client"
import React from "react";

//import Autocomplete from "@/component/Autocomplete";
import TableWithAutocompletes from "@/component/TableWithAutocomplete";
import CsvUploaderAutocomplete from "@/component/CsvUploaderAutocomplete";
import CsvEditableTable from "@/component/CsvEditableTable";
import EditableCsvTable from "@/component/EditableCsvTable";
import CsvLoader from "@/component/CsvLoader";
function App() {
  return (
    <div>
      <h1>Autocomplete Demo</h1>
      {/* <TableWithAutocompletes /> */}
      {/* <CsvUploaderAutocomplete /> */}
      {/* <EditableCsvTable /> */}
      <CsvLoader />
    </div>
  );
}

export default App;
