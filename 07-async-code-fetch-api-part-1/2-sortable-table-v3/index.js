import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  onHeaderClick = event => {
    const header = event.target.closest('.sortable-table__cell');
    if (!header)
      return;
      
    const headerId = header.dataset.id;

    if (!this.headerConfig.find(item => item.id === headerId)?.sortable) {
      return;
    }

    this.sortDirection = this.getSortDirection(headerId);
    this.sortedField = headerId;

    this.updateHeaders(header);
    this.reset();

    if (this.isSortLocally) {
      this.sortOnClient(this.sortedField, this.sortDirection);
    } else {
      this.sortOnServer(this.sortedField, this.sortDirection);
    }
  }

  onScroll = async event => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // no infinity scroll for local sorting, all data must be loaded in the first batch
    if (this.isSortLocally)
      return;

    const screenBottomOffset = 50;
    if ((scrollTop + clientHeight >= scrollHeight - screenBottomOffset) && !this.lock) {
      this.lock = true;
      await this.loadData();
      this.lock = false;
    }
  }

  constructor(headersConfig = [], {
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    url,
    isSortLocally = false,
    batchSize = 30,
  } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.sortedField = sorted.id;
    this.sortDirection = sorted.order;
    this.sorted = sorted;
    this.offset = 0;
    this.batchSize = batchSize;
    this.data = [];

    this.render();
  }

  async render() {
    this.offset = 0;
    this.data = [];
    this.init();
    await this.loadData();
  }

  init() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.addEventListeners();
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaders().join('')}
        </div>
        <div data-element="body" class="sortable-table__body"></div>
      </div>
    `;
  }
  

  async loadData () {
    const json = await this.fetchData(this.offset, this.offset + this.batchSize, this.sortedField, this.sortDirection);
    const data = Object.values(json);
    this.offset += data.length;
    this.data.push(...data);
    
    this.appendData(data);
  }

  sortOnClient(id, order) {
    const header = this.headerConfig.find(h => h.id === id);
    if (!header.sortable)
      return;

    this.data = this.sortValues(this.data, id, header.sortType, order);
    this.appendData(this.data);
  }

  async sortOnServer (id, order) {
    await this.loadData();
  }

  appendData(data) {
    const rows = this.getRows(data);
    this.subElements.body.innerHTML += rows.join('');
  }

  fetchData(start, end, sortField, sortDirection) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.append('_start', start);
    url.searchParams.append('_end', end);
    url.searchParams.append('_sort', sortField);
    url.searchParams.append('_order', sortDirection);

    return fetchJson(url);
  }

  getRows(data) {
    return data.map(i => this.getRow(i));
  }
  
  getRow(item) {
    return `
      <a href="#" class="sortable-table__row">
        ${this.headerConfig.map(h => this.getCell(h, item)).join('')}
      </a>
    `;
  }

  getCell(header, item) {
    const template = header.template ?? (data => `<div class="sortable-table__cell">${data}</div>`);
    return template(item[header.id]);
  }

  updateHeaders(sortedHeader) {
    sortedHeader.dataset.order = this.sortDirection;
    const arrow = this.subElements.arrow;
    arrow.remove();
    sortedHeader.append(arrow);
  }

  getSortDirection(targetField) {
    if (this.sortedField !== targetField)
      return 'asc';
     
    if (this.sortDirection === 'asc')
      return 'desc';

    return 'asc';
  }

  getHeaders() {
    return this.headerConfig.map(h => this.getHeader(h));
  }

  getHeader(header) {
    const sortArrowTemplate = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    const sortArrow = this.sortedField === header.id ? sortArrowTemplate : '';
    const dataOrder = this.sortDirection ? `data-order="${this.sortDirection}` : '';

    return `
      <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" ${dataOrder}">
        <span>${header.title}</span>
        ${sortArrow}
      </div>
    `;
  }
  
  sortValues(arr, field, sortType = 'string', param = 'asc') {
    const sortDirection = param !== 'desc' ? 1 : -1;
    const sortFunction = this.getSortFunction(sortType, field, sortDirection);
    return [...arr].sort(sortFunction);
  }

  getSortFunction(sortType, field, direction) {
    switch (sortType) {
      case 'number':
        return (a, b) => direction * (a[field] - b[field]);

      default:
        return (a, b) => direction * a[field].localeCompare(b[field], 'ru-en', { caseFirst: 'upper' });
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    document.addEventListener('scroll', this.onScroll);
  }

  reset() {
    this.offset = 0;
    this.subElements.body.innerHTML = '';
  }

  destroy () {
    this.subElements?.header?.removeEventListener('pointerdown', this.onHeaderClick);
    document.removeEventListener('scroll', this.onScroll);
    this.element?.remove();
    this.element = null;
    this.subElements = null;
  }
}
