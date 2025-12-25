// Metronic Theme Colors for Charts
export const chartColors = {
  primary: '#752C84',
  primaryLight: '#F3E5F5',
  success: '#17C653',
  successLight: '#EAFFF1',
  danger: '#F8285A',
  dangerLight: '#FFEEF3',
  warning: '#F6B100',
  warningLight: '#FFF8DD',
  info: '#7239EA',
  infoLight: '#F8F5FF',
  brand: '#FF6F1E',
  brandLight: '#FFF5EF',
  gray: {
    100: '#F9F9F9',
    200: '#F1F1F4',
    300: '#DBDFE9',
    500: '#99A1B7',
    700: '#4B5675',
    900: '#071437'
  }
};

// Default ApexCharts theme configuration
export const getApexChartOptions = () => ({
  chart: {
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      }
    }
  },
  tooltip: {
    theme: 'light',
    style: {
      fontSize: '13px',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    x: {
      show: true
    },
    y: {
      formatter: (value: number) => {
        if (value === null || value === undefined) return 'N/A';
        return value.toLocaleString();
      }
    }
  },
  grid: {
    borderColor: chartColors.gray[200],
    strokeDashArray: 3,
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    },
    padding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 10
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth' as const,
    width: 3
  },
  xaxis: {
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    labels: {
      style: {
        colors: chartColors.gray[700],
        fontSize: '13px',
        fontWeight: 500
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: chartColors.gray[700],
        fontSize: '13px',
        fontWeight: 500
      }
    }
  },
  legend: {
    show: true,
    position: 'top' as const,
    horizontalAlign: 'left' as const,
    fontSize: '13px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 500,
    labels: {
      colors: chartColors.gray[700]
    },
    markers: {
      width: 12,
      height: 12,
      radius: 3
    },
    itemMargin: {
      horizontal: 12,
      vertical: 5
    }
  }
});

// Format date to readable format like "May 2025"
export const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short'
  };
  return date.toLocaleDateString('en-US', options);
};

// Format date with day like "May 15, 2025"
export const formatChartDateWithDay = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};
