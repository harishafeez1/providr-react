import { KeenIcon } from '@/components';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { chartColors, getApexChartOptions, formatChartDate } from '@/utils/chartTheme';

interface RestrictivePracticeTrends {
  compliance_status: string;
  change_indicator: string;
  total_uses_12mo: number;
  overall_rate: number;
  three_month_trend: string;
  trend_chart_data: Array<{ date: string; count: number; rate: number }>;
}

interface RestrictivePracticeTrendsProps {
  rpTrends: RestrictivePracticeTrends | null;
}

const RestrictivePracticeTrends = ({ rpTrends }: RestrictivePracticeTrendsProps) => {
  if (!rpTrends) {
    return null;
  }

  const hasChartData = rpTrends?.trend_chart_data && rpTrends.trend_chart_data.length > 0;

  const baseOptions = getApexChartOptions();
  const chartOptions: ApexOptions = {
    chart: {
      ...baseOptions.chart,
      type: 'line',
      height: 350
    },
    colors: [chartColors.primary, chartColors.gray[500]],
    xaxis: {
      ...baseOptions.xaxis,
      categories: rpTrends.trend_chart_data?.map((d) => formatChartDate(d.date)) || []
    },
    yaxis: [
      {
        title: {
          text: 'Count',
          style: {
            color: chartColors.gray[700],
            fontSize: '13px',
            fontWeight: 500
          }
        },
        labels: {
          style: {
            colors: chartColors.gray[700],
            fontSize: '13px',
            fontWeight: 500
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Rate (%)',
          style: {
            color: chartColors.gray[700],
            fontSize: '13px',
            fontWeight: 500
          }
        },
        labels: {
          style: {
            colors: chartColors.gray[700],
            fontSize: '13px',
            fontWeight: 500
          },
          formatter: (value: number) => `${value}%`
        }
      }
    ],
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    markers: {
      size: 4,
      hover: {
        size: 6
      }
    },
    tooltip: baseOptions.tooltip,
    grid: baseOptions.grid,
    dataLabels: baseOptions.dataLabels
  };

  const series = [
    {
      name: 'Count',
      data: rpTrends.trend_chart_data?.map((d) => d.count) || []
    },
    {
      name: 'Rate (%)',
      data: rpTrends.trend_chart_data?.map((d) => d.rate) || []
    }
  ];

  return (
    <div className="card mb-5">
      <div className="card-header">
        <h3 className="card-title">
          <KeenIcon icon="shield-tick" className="text-primary" />
          Restrictive Practice Trends
        </h3>
        <div className="flex items-center gap-2">
          <span className="badge badge-sm badge-primary">NDIS Compliance</span>
          <span className="text-2sm text-gray-600">{rpTrends?.change_indicator || 'No change'}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="bg-primary-light p-4 rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="text-2sm font-medium text-gray-700 mb-1">Total Uses (12mo)</div>
            <div className="text-2xl font-semibold text-gray-900">{rpTrends?.total_uses_12mo || 0}</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="text-2sm font-medium text-gray-700 mb-1">Overall Rate</div>
            <div className="text-2xl font-semibold text-gray-900">{rpTrends?.overall_rate || 0}%</div>
          </div>
          <div className="bg-primary-light p-4 rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="text-2sm font-medium text-gray-700 mb-1">3-Month Trend</div>
            <div className="text-lg font-semibold text-gray-900">{rpTrends?.three_month_trend || '→'}</div>
          </div>
        </div>

        {hasChartData ? (
          <ReactApexChart options={chartOptions} series={series} type="line" height={350} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No trend data available
          </div>
        )}
      </div>
    </div>
  );
};

export { RestrictivePracticeTrends };
