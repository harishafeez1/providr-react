import { KeenIcon } from '@/components';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { chartColors, getApexChartOptions } from '@/utils/chartTheme';

interface DistributionData {
  by_type?: Array<{ type: string; count: number }>;
}

interface IncidentDistributionChartsProps {
  distribution: DistributionData | null;
}

const IncidentDistributionCharts = ({ distribution }: IncidentDistributionChartsProps) => {
  console.log('IncidentDistributionCharts received:', distribution);

  if (!distribution) {
    return null;
  }

  const hasByType = distribution?.by_type && distribution.by_type.length > 0;

  if (!hasByType) {
    return null;
  }

  // Transform "unknown" to "Others" in incident types
  const transformedByType = distribution.by_type?.map((item) => ({
    ...item,
    type: item.type?.toLowerCase() === 'unknown' || !item.type ? 'Others' : item.type
  })) || [];

  // Bar Chart Options for Incidents by Type
  const baseOptions = getApexChartOptions();
  const barChartOptions: ApexOptions = {
    chart: {
      ...baseOptions.chart,
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
        columnWidth: '50%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: [chartColors.primary],
    xaxis: {
      ...baseOptions.xaxis,
      categories: transformedByType.map((d) => d.type) || []
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: [chartColors.gray[700]]
      }
    },
    tooltip: baseOptions.tooltip,
    grid: baseOptions.grid,
    yaxis: baseOptions.yaxis
  };

  const barChartSeries = [
    {
      name: 'Incidents',
      data: transformedByType.map((d) => d.count) || []
    }
  ];

  // Pie Chart Options for Incidents by Type
  const pieChartOptions: ApexOptions = {
    chart: {
      ...baseOptions.chart,
      type: 'pie',
      height: 400
    },
    colors: [
      chartColors.primary,      // #752C84 - Primary Purple
      '#9C7AB5',                // Light Purple
      '#B89DCB',                // Lighter Purple
      '#D4C1E0',                // Very Light Purple
      '#E8DFF0',                // Pale Purple
      '#F3E5F5'                 // Primary Light
    ],
    labels: transformedByType.map((d) => d.type) || [],
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return `${Math.round(val)}%`;
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#fff']
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 2,
        opacity: 0.5
      }
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
      fontSize: '11px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 500,
      floating: false,
      offsetY: 5,
      itemMargin: {
        horizontal: 8,
        vertical: 0
      },
      containerMargin: {
        left: 0,
        top: 5
      }
    },
    tooltip: {
      ...baseOptions.tooltip,
      style: {
        fontSize: '13px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      y: {
        formatter: (value: number) => {
          return `${value} incidents`;
        }
      },
      fillSeriesColor: false,
      theme: 'light'
    }
  };

  const pieChartSeries = transformedByType.map((d) => d.count) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      {/* Incidents by Type */}
      {hasByType ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <KeenIcon icon="category" className="text-primary" />
              <span>Incidents by Type</span>
            </h3>
          </div>
          <div className="card-body">
            <ReactApexChart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <KeenIcon icon="category" className="text-primary" />
              <span>Incidents by Type</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-500">
              No distribution data available
            </div>
          </div>
        </div>
      )}

      {/* Incidents by Type - Pie Chart */}
      {hasByType ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <KeenIcon icon="chart-pie-simple" className="text-primary" />
              <span>Incident Type Distribution</span>
            </h3>
          </div>
          <div className="card-body">
            <div style={{ width: '100%' }}>
              <style>{`
                .apexcharts-legend {
                  display: flex !important;
                  flex-direction: row !important;
                  flex-wrap: wrap !important;
                  justify-content: center !important;
                }
                .apexcharts-legend-series {
                  display: inline-flex !important;
                  margin: 2px 8px !important;
                }
              `}</style>
              <ReactApexChart options={pieChartOptions} series={pieChartSeries} type="pie" height={400} />
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <KeenIcon icon="chart-pie-simple" className="text-primary" />
              <span>Incident Type Distribution</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-500">
              No distribution data available
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { IncidentDistributionCharts };
