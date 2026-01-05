import { KeenIcon } from '@/components';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { chartColors, getApexChartOptions, formatChartDate } from '@/utils/chartTheme';

interface IncidentTrendsData {
  total_incidents_in_period: number;
  chart_data: Array<{
    date: string;
    total_incidents: number;
    critical: number;
    serious: number;
    moderate: number;
  }>;
}

interface IncidentTrendsChartProps {
  incidentTrends: IncidentTrendsData | null;
}

const IncidentTrendsChart = ({ incidentTrends }: IncidentTrendsChartProps) => {
  console.log('IncidentTrendsChart received:', incidentTrends);

  if (!incidentTrends) {
    return null;
  }

  const chartData = incidentTrends?.chart_data || [];
  const hasData = chartData.length > 0;

  const baseOptions = getApexChartOptions();
  const chartOptions: ApexOptions = {
    chart: {
      ...baseOptions.chart,
      type: 'line',
      height: 380,
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    colors: [
      chartColors.primary,  // #752C84 - Primary Purple (Total Incidents)
      '#9C7AB5',            // Light Purple (Critical)
      '#B89DCB',            // Lighter Purple (Serious)
      '#D4C1E0'             // Very Light Purple (Moderate)
    ],
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    markers: {
      size: 0,
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    xaxis: {
      ...baseOptions.xaxis,
      categories: chartData.map((d) => formatChartDate(d.date))
    },
    yaxis: {
      ...baseOptions.yaxis,
      title: {
        text: 'Number of Incidents',
        style: {
          color: chartColors.gray[700],
          fontSize: '13px',
          fontWeight: 500
        }
      },
      decimalsInFloat: 0,
      forceNiceScale: true,
      min: 0,
      labels: {
        ...baseOptions.yaxis?.labels,
        formatter: (value: number) => {
          return Math.floor(value).toString();
        }
      }
    },
    tooltip: {
      ...baseOptions.tooltip,
      shared: true,
      intersect: false
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'center' as const,
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 500,
      floating: false,
      offsetY: 5,
      itemMargin: {
        horizontal: 12,
        vertical: 0
      },
      containerMargin: {
        left: 0,
        top: 5
      }
    },
    grid: baseOptions.grid,
    dataLabels: baseOptions.dataLabels
  };

  const series = [
    {
      name: 'Total Incidents',
      data: chartData.map((d) => d.total_incidents)
    },
    {
      name: 'Critical',
      data: chartData.map((d) => d.critical)
    },
    {
      name: 'Serious',
      data: chartData.map((d) => d.serious)
    },
    {
      name: 'Moderate',
      data: chartData.map((d) => d.moderate)
    }
  ];

  return (
    <div className="card mb-5">
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <KeenIcon icon="chart-line" className="text-primary" />
          <span>Incident Trends Over Time</span>
        </h3>
        <div className="text-2sm text-gray-600">
          {incidentTrends.total_incidents_in_period || 0} incidents in selected period
        </div>
      </div>
      <div className="card-body">
        {hasData ? (
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
                margin: 2px 12px !important;
              }
            `}</style>
            <ReactApexChart options={chartOptions} series={series} type="line" height={380} />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No trend data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
};

export { IncidentTrendsChart };
