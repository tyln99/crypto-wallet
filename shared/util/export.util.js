import { isArray } from 'lodash'

//create a user-defined function to download CSV file
export function download_csv_file(filename, csvFileData) {
  if (!isArray(csvFileData)) {
    throw new Error('CsvData must be an array')
  }

  var csv = ''

  //merge the data with CSV
  csvFileData.forEach(function(row) {
    csv += row.join(',')
    csv += '\n'
  })

  var hiddenElement = document.createElement('a')
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
  hiddenElement.target = '_blank'

  //provide the name for the CSV file to be downloaded
  hiddenElement.download = filename
  hiddenElement.click()
}
