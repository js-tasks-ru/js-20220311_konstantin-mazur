export default class ColumnChart {
  constructor({data = [], label = '', value = 0, link = '', chartHeight = 50, formatHeading = this.formatHeadingDefault} = {})
  {
    this.chartValues = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.chartHeight = chartHeight;
    this.formatHeading = formatHeading;

    this.render();
  }

  update (data = []) {
    this.chartValues = data;
    this.render();
  }

  render() {
    let element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    element = element.firstElementChild;

    if (this.chartValues.length === 0) {
      element.classList.add("column-chart_loading"); 
    }

    this.element = element;
  }

  getTemplate () {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          <a href="${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.formatHeading(this.value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartColumns().join('')}
          </div>
        </div>
      </div>`;
  }

  formatHeadingDefault(header) {
    return header;
  }

  getChartColumns() {
    const maxValue = Math.max(...this.chartValues);
    const scale = this.chartHeight / maxValue;
    return this.chartValues.map(value => `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${(value / maxValue * 100).toFixed(0)}%"></div>`);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
  }
}
