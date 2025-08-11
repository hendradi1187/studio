export const datasets = [
  {
    id: 'ds001',
    title: 'Seismic Survey Block A-1',
    institution: 'Alpha Oil & Gas',
    date: '2023-10-15',
    accessStatus: 'Restricted',
    abstract: 'Comprehensive 3D seismic survey data for exploration block A-1, covering an area of 500 sq km.',
    structure: 'SEG-Y, Navigation Data, Velocity Models',
    format: '.sgy, .txt, .json',
  },
  {
    id: 'ds002',
    title: 'Well Log Data - Well X-7',
    institution: 'Beta Petroleum',
    date: '2023-09-20',
    accessStatus: 'Open',
    abstract: 'Complete suite of wireline logs from the exploratory well X-7, including gamma ray, resistivity, and sonic logs.',
    structure: 'LAS files for each log run, summary report',
    format: '.las, .pdf',
  },
  {
    id: 'ds003',
    title: 'Production Data - Field Z',
    institution: 'Gamma Energy',
    date: '2024-01-01',
    accessStatus: 'By Request',
    abstract: 'Monthly production data for oil, gas, and water from all wells in Field Z for the last 5 years.',
    structure: 'Time-series data, well-level aggregation',
    format: '.csv, .xlsx',
  },
  {
    id: 'ds004',
    title: 'Geochemical Analysis Report',
    institution: 'SKK Migas',
    date: '2023-05-11',
    accessStatus: 'Open',
    abstract: 'Regional geochemical analysis of source rocks in the East Java basin.',
    structure: 'TOC, Rock-Eval pyrolysis, vitrinite reflectance data',
    format: '.pdf, .xls',
  },
  {
    id: 'ds005',
    title: 'Gravity & Magnetic Survey - Basin Y',
    institution: 'Delta Geophysics',
    date: '2022-11-30',
    accessStatus: 'Restricted',
    abstract: 'High-resolution airborne gravity and magnetic survey data covering the entire Y basin.',
    structure: 'Gridded data, processed maps',
    format: '.grd, .gdb, .png',
  },
];

export const users = [
  {
    id: 'usr01',
    name: 'Admin Spektor',
    email: 'admin@spektor.com',
    role: 'Admin',
    organization: 'SKK Migas',
    lastActive: '2 hours ago',
  },
  {
    id: 'usr02',
    name: 'John Doe',
    email: 'john.doe@alphaoil.com',
    role: 'KKKS',
    organization: 'Alpha Oil & Gas',
    lastActive: '1 day ago',
  },
  {
    id: 'usr03',
    name: 'Jane Smith',
    email: 'jane.smith@betapetrol.com',
    role: 'KKKS',
    organization: 'Beta Petroleum',
    lastActive: '5 hours ago',
  },
  {
    id: 'usr04',
    name: 'Peter Jones',
    email: 'peter.jones@skkmigas.go.id',
    role: 'Validator',
    organization: 'SKK Migas',
    lastActive: '30 minutes ago',
  },
  {
    id: 'usr05',
    name: 'Mary Williams',
    email: 'mary.w@gammaenergy.com',
    role: 'Viewer',
    organization: 'Gamma Energy',
    lastActive: '3 days ago',
  },
];

export const vocabulary = [
  { term: 'Working Area' },
  {
    term: 'Seismic',
    children: [
      { term: '2D Seismic Data' },
      { term: '3D Seismic Data' },
      { term: 'Seismic Attributes' },
    ],
  },
  {
    term: 'Well (Sumur)',
    children: [
      { term: 'Well Log' },
      { term: 'Well Core' },
      { term: 'Well Test Data' },
      { term: 'Drilling Report' },
    ],
  },
  {
    term: 'Field (Lapangan)',
    children: [
      { term: 'Production Data' },
      { term: 'Reservoir Model' },
      { term: 'PVT Analysis' },
    ],
  },
  {
    term: 'Facilities',
    children: [
        { term: 'Pipeline Data' },
        { term: 'Platform Information' },
        { term: 'Processing Plant Specs' },
    ]
  },
];

export const mockState = {
  brokerConnections: [
    { name: 'Alpha Oil & Gas', status: 'Active', lastSync: '2024-05-21 10:00:00' },
    { name: 'Beta Petroleum', status: 'Active', lastSync: '2024-05-21 10:05:00' },
    { name: 'Gamma Energy', status: 'Inactive', lastSync: '2024-05-20 08:30:00' },
    { name: 'Delta Geophysics', status: 'Active', lastSync: '2024-05-21 09:55:00' },
    { name: 'Epsilon Resources', status: 'Error', lastSync: '2024-05-19 14:00:00' },
  ]
};


export const transactionLogs = [
  { id: 'log01', timestamp: '2024-05-21 09:15:23', user: 'john.doe@alphaoil.com', institution: 'Alpha Oil & Gas', action: 'Download Metadata', status: 'Success', details: 'ds002' },
  { id: 'log02', timestamp: '2024-05-21 08:45:10', user: 'jane.smith@betapetrol.com', institution: 'Beta Petroleum', action: 'Request Access', status: 'Pending', details: 'ds001' },
  { id: 'log03', timestamp: '2024-05-20 17:20:05', user: 'admin@spektor.com', institution: 'SKK Migas', action: 'Approve Access', status: 'Success', details: 'jane.smith -> ds005' },
  { id: 'log04', timestamp: '2024-05-20 11:05:45', user: 'mary.w@gammaenergy.com', institution: 'Gamma Energy', action: 'Search', status: 'Success', details: 'Keyword: "well log"' },
  { id: 'log05', timestamp: '2024-05-19 14:00:00', user: 'System', institution: 'SPEKTOR', action: 'Sync Metadata', status: 'Failed', details: 'Epsilon Resources' },
];

export const notifications = [
    { id: 1, title: 'Access Granted', message: 'Your request to access "Seismic Survey Block A-1" has been approved.', date: '2024-05-21 11:00 AM', read: false },
    { id: 2, title: 'New Dataset', message: 'A new dataset "Well Log Data - Well Y-12" from Beta Petroleum is now available.', date: '2024-05-20 03:45 PM', read: false },
    { id: 3, title: 'Sync Failure', message: 'Metadata synchronization with Gamma Energy failed. Please check connection status.', date: '2024-05-20 08:31 AM', read: true },
]
