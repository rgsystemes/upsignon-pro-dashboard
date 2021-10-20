import React from 'react';
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
} from 'recharts';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

class UsageChart extends React.Component {
  state = {
    stats: [],
  };
  fetchStats = async () => {
    try {
      const stats = await fetchTemplate('/api/get-usage-stats', 'GET', null);
      this.setState({
        stats: stats.map((s) => ({
          ...s,
          day: new Date(s.day).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        })),
      });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchStats();
  }
  render() {
    return (
      <React.Fragment>
        <h2>{i18n.t('chart_usage_title')}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            width={500}
            height={350}
            data={this.state.stats}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 10" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Area
              type="monotone"
              dataKey="nbUsers"
              name={i18n.t('chart_nb_users')}
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </React.Fragment>
    );
  }
}

export { UsageChart };
