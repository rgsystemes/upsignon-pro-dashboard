import React from 'react';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
} from 'recharts';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

class SecurityChart extends React.Component {
  state = {
    stats: [],
  };
  fetchStats = async () => {
    try {
      const stats = await fetchTemplate('/api/get-password-stats', 'GET', null);
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
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
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
            dataKey="nbAccountsWeak"
            name={i18n.t('chart_weak_pwd')}
            stackId="1"
            stroke="red"
            fill="red"
          />
          <Area
            type="monotone"
            dataKey="nbAccountsMedium"
            name={i18n.t('chart_medium_pwd')}
            stackId="1"
            stroke="#ffc658"
            fill="#ffc658"
          />
          <Area
            type="monotone"
            dataKey="nbAccountsStrong"
            name={i18n.t('chart_strong_pwd')}
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
          <Line
            type="monotone"
            dataKey="nbDuplicatePasswords"
            name={i18n.t('chart_duplicate_pwd')}
            stackId="2"
            stroke="black"
            fill="black"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="nbAccounts"
            name={i18n.t('chart_nb_accounts')}
            stackId="3"
            stroke="black"
            fill="black"
            dot={false}
            legendType="none"
            strokeWidth={0}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
}

export { SecurityChart };
