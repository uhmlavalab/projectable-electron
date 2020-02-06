export const chartColors = {
  DGPV: '#E17C05',
  DER: '#E17C05',
  PV: '#EDAD08',
  Fossil: '#CC503E',
  Bio: '#73AF48',
  Battery: '#5F4690',
  Wind: '#2a52be', //38A6A5
  Offshore: '#5F4690',
  Geo: '#ac346a',
  Hydro: '#38A6A5', //5F4690 /2a52be
};

export const mapLayerColors = {
  Solar: {
    fill: chartColors.DGPV,
    border: 'white',
    legend: chartColors.DGPV
  },
  Dod: {
    fill: '#CC503E',
    border: 'white',
    legend: '#CC503E'
  },
  Wind: {
    fill: chartColors.Wind,
    border: 'white',
    legend: chartColors.Wind
  },
  Existing_RE: {
    fill: '#38A6A5',
    border: 'white',
    legend: '#38A6A5'
  },
  Transmission: {
    fill: 'transparent',
    border: '#ccff00',
    legend: '#ccff00'
  },
  Agriculture: {
    fill: '#0F8554',
    border: 'white',
    legend: '#0F8554'
  },
  Parks: {
    fill: '#994E95',
    border: 'white',
    legend: '#994E95'
  },
  Ial: {
    fill: 'white',
    border: 'white',
    legend: '#000000'
  }
};
