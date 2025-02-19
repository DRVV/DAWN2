"use client"
import React from 'react';
import ExcelHtmlViewer from '@/component/ExcelHtmlViewer';



function App() {

  const excelPath = '/excelfiles/ブック_テスト.xlsx'

  return (
    <div>
      <h1>Excel to HTML Demo</h1>
      <ExcelHtmlViewer excelUrl={excelPath}/>
    </div>
  );
}

export default App;
