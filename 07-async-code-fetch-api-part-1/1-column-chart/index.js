import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  constructor({url = [], range = {}, label = '', link = '', chartHeight = 50, formatHeading = data => data } = {})
  {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.chartHeight = chartHeight;
    this.formatHeading = formatHeading;

    this.init();
    this.update(range.from, range.to);
  }

  init() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  async update (from, to) {
    if (!from || !to)
      return;
  
    this.data = [];
    this.toogleLoadingState();
  
    const json = await this.getData(from, to);
    this.data = Object.entries(json);

    this.render();
    this.toogleLoadingState();

    return json;
  }

  toogleLoadingState() {
    if (this.data.length > 0) {
      this.element.classList.remove('column-chart_loading');
    } else {
      this.element.classList.add('column-chart_loading');
    }
  }

  getData(from, to) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);

    return fetchJson(url);
  }

  render() {
    if (this.data.length === 0)
      return;

    const values = this.data.map(([key, value]) => value);

    const totalValue = values.reduce((agg, value) => agg += value);
    this.subElements.header.textContent = this.formatHeading(totalValue);

    const columns = this.getChartColumns(values).join('');
    this.subElements.body.innerHTML = columns;
  }

  getTemplate () {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          <a href="${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>`;
  }

  getChartColumns(values) {
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;
    return values.map(value => `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${(value / maxValue * 100).toFixed(0)}%"></div>`);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  destroy () {
    this.element?.remove();
    this.subElements = null;
    this.element = null;
  }
}
