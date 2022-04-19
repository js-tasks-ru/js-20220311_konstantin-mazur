import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  onDateSelect = event => {
    const {from, to} = event.detail;
    this.columnChartOrders.update(from, to);
    this.columnChartSales.update(from, to);
    this.columnChartCustomers.update(from, to);
  }

  constructor() {
    this.init();
  }

  init() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  render() {
    const from = new Date();
    const to = new Date();
    from.setDate(to.getDate() - 30);

    this.rangePicker = new RangePicker({ from: from, to: to });
    this.rangePicker.element.dataset.pageElement = 'rangePicker';
    this.subElements.rangePickerContainer.append(this.rangePicker.element);

    const columnChartConfig = {
      label: 'orders',
      link: '/sales',
      url: 'api/dashboard/orders',
      range: {
        from: from,
        to: to,
      }
    };

    columnChartConfig.label = 'orders';
    columnChartConfig.link = '/orders';
    columnChartConfig.url = 'api/dashboard/orders';
    this.columnChartOrders = new ColumnChart(columnChartConfig);
    this.columnChartOrders.element.dataset.pageElement = 'ordersChart';
    this.columnChartOrders.element.classList.add('dashboard__chart_orders');
    this.subElements.columncChartsContainer.append(this.columnChartOrders.element);
    columnChartConfig.label = 'sales';
    columnChartConfig.link = '/sales';
    columnChartConfig.url = 'api/dashboard/sales';
    this.columnChartSales = new ColumnChart(columnChartConfig);
    this.columnChartSales.element.dataset.pageElement = 'salesChart';
    this.columnChartSales.element.classList.add('dashboard__chart_sales');
    this.subElements.columncChartsContainer.append(this.columnChartSales.element);
    columnChartConfig.label = 'customers';
    columnChartConfig.link = '/customers';
    columnChartConfig.url = 'api/dashboard/customers';
    this.columnChartCustomers = new ColumnChart(columnChartConfig);
    this.columnChartCustomers.element.dataset.pageElement = 'customersChart';
    this.columnChartCustomers.element.classList.add('dashboard__chart_customers');
    this.subElements.columncChartsContainer.append(this.columnChartCustomers.element);
    
    const tableConfig = {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true
    };
    this.sortableTable = new SortableTable(header, tableConfig);
    this.sortableTable.element.dataset.pageElement = 'sortableTable';
    this.subElements.sortableTableContainer.append(this.sortableTable.element);

    this.subElements = this.getSubElements(this.element);

    return this.element;
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
            <div data-page-element="rangePickerContainer"></div>
        </div>
        <div data-page-element="columncChartsContainer" class="dashboard__charts"></div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-page-element="sortableTableContainer"></div>
      </div>
    `;
  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-page-element]')) {
      subElements[subElement.dataset.pageElement] = subElement;
    }

    return subElements;
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.element?.remove();
  }
}
