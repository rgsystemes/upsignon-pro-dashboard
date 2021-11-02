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
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getLocaleDateFormat, getDateBack1Month } from '../../helpers/dateHelper';
import { Toggler } from '../../helpers/Toggler';

class SecurityChart extends React.Component {
  rawStats = [];
  usePctg = false;
  useEntropy = false;
  startDate = getDateBack1Month();
  endDate = new Date();

  state = {
    stats: [],
  };

  showStats = () => {
    this.setState({
      stats: this.rawStats.map((s) => {
        const sum = s.nbAccounts;
        return {
          ...s,
          day: new Date(s.day).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
          nbAccounts: s.nbAccounts,
          nbAccountsWithNoPassword: this.usePctg
            ? (s.nbAccountsWithNoPassword / sum) * 100
            : s.nbAccountsWithNoPassword,
          nbAccountsWeak: this.usePctg ? (s.nbAccountsWeak / sum) * 100 : s.nbAccountsWeak,
          nbAccountsMedium: this.usePctg ? (s.nbAccountsMedium / sum) * 100 : s.nbAccountsMedium,
          nbAccountsStrong: this.usePctg ? (s.nbAccountsStrong / sum) * 100 : s.nbAccountsStrong,
          nbDuplicatePasswords: this.usePctg
            ? (s.nbDuplicatePasswords / sum) * 100
            : s.nbDuplicatePasswords,
          nbAccountsRed: this.usePctg ? (s.nbAccountsRed / sum) * 100 : s.nbAccountsRed,
          nbAccountsOrange: this.usePctg ? (s.nbAccountsOrange / sum) * 100 : s.nbAccountsOrange,
          nbAccountsGreen: this.usePctg ? (s.nbAccountsGreen / sum) * 100 : s.nbAccountsGreen,
        };
      }),
    });
  };
  fetchStats = async () => {
    try {
      const stats = await groupUrlFetch(
        `/api/get-password-stats?start=${this.startDate.toISOString()}&end=${this.endDate.toISOString()}`,
        'GET',
        null,
      );
      this.rawStats = stats;
      this.showStats();
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    const savedStartDate = sessionStorage['startDate'];
    if (savedStartDate) this.startDate = new Date(savedStartDate);
    const savedEndDate = sessionStorage['endDate'];
    if (savedEndDate) this.startDate = new Date(savedEndDate);
    this.fetchStats();
  }
  togglePctg = (usePctg) => {
    this.usePctg = usePctg;
    this.showStats();
  };
  toggleEntropy = (useEntropy) => {
    this.useEntropy = useEntropy;
    this.showStats();
  };
  updateStartDate = (newStartDate) => {
    if (this.startDate.getTime() !== newStartDate.getTime()) {
      this.startDate = newStartDate;
      this.fetchStats();
      sessionStorage['startDate'] = newStartDate.toISOString();
    }
  };
  updateEndDate = (newEndDate) => {
    if (this.endDate.getTime() !== newEndDate.getTime()) {
      this.endDate = newEndDate;
      this.fetchStats();
      sessionStorage['endDate'] = newEndDate.toISOString();
    }
  };
  clearDates = () => {
    sessionStorage.clear();
    this.startDate = getDateBack1Month();
    this.endDate = new Date();
    this.fetchStats();
  };
  render() {
    return (
      <React.Fragment>
        <h2>{i18n.t('chart_security_title')}</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 20 }}>
          <Toggler
            choices={[
              { key: 'color', title: i18n.t('chart_type_color'), isCurrent: !this.useEntropy },
              { key: 'entropy', title: i18n.t('chart_type_entropy'), isCurrent: this.useEntropy },
            ]}
            onSelect={(choice) => this.toggleEntropy(choice === 'entropy')}
          />
          <div style={{ width: 20 }} />
          <Toggler
            choices={[
              { key: 'nb', title: i18n.t('chart_type_nb'), isCurrent: !this.usePctg },
              { key: 'pctg', title: '%', isCurrent: this.usePctg },
            ]}
            onSelect={(choice) => this.togglePctg(choice === 'pctg')}
          />
          <div style={{ marginLeft: 20 }}>
            <div>{i18n.t('chart_start_date')}</div>
            <DatePicker
              selected={this.startDate}
              onChange={this.updateStartDate}
              allowSameDay={false}
              dateFormat={getLocaleDateFormat()}
              maxDate={new Date()}
            />
          </div>
          <div style={{ marginLeft: 20 }}>
            <div>{i18n.t('chart_end_date')}</div>
            <DatePicker
              selected={this.endDate}
              onChange={this.updateEndDate}
              dateFormat={getLocaleDateFormat()}
              maxDate={new Date()}
              todayButton={<div>{i18n.t('chart_today_button')}</div>}
            />
          </div>
          <div className="action" style={{ marginLeft: 10 }} onClick={this.clearDates}>
            {i18n.t('chart_automatic_dates')}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
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
            <YAxis
              allowDecimals={false}
              unit={this.usePctg ? '%' : 0}
              domain={this.usePctg ? [0, 100] : [0, 'auto']}
              allowDataOverflow
            />
            <Tooltip
              formatter={(value, name) => {
                if (!this.usePctg) return value;
                const roundedValue = Math.round(value * 10) / 10;
                if (name !== i18n.t('chart_nb_accounts')) {
                  return roundedValue + '%';
                }
                return roundedValue;
              }}
            />
            <Legend verticalAlign="top" />
            <Area
              type="monotone"
              dataKey="nbAccountsWithNoPassword"
              name={i18n.t('chart_no_pwd')}
              stackId="1"
              stroke="grey"
              fill="grey"
            />
            <Area
              type="monotone"
              dataKey={this.useEntropy ? 'nbAccountsWeak' : 'nbAccountsRed'}
              name={this.useEntropy ? i18n.t('chart_weak_pwd') : i18n.t('chart_red_pwd')}
              stackId="1"
              stroke="red"
              fill="red"
            />
            <Area
              type="monotone"
              dataKey={this.useEntropy ? 'nbAccountsMedium' : 'nbAccountsOrange'}
              name={this.useEntropy ? i18n.t('chart_medium_pwd') : i18n.t('chart_orange_pwd')}
              stackId="1"
              stroke="#ffc658"
              fill="#ffc658"
            />
            <Area
              type="monotone"
              dataKey={this.useEntropy ? 'nbAccountsStrong' : 'nbAccountsGreen'}
              name={this.useEntropy ? i18n.t('chart_strong_pwd') : i18n.t('chart_green_pwd')}
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
      </React.Fragment>
    );
  }
}

export { SecurityChart };
