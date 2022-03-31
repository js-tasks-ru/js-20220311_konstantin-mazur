export default class SortableTable {
  ASCSORT = 'asc';
  DESCSORT = 'desc';

  constructor(headersConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: this.ASCSORT
    }
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sortFunctions = {
      string: this.sortStrings,
      number: this.sortNumbers,
    };

    this.sortData(sorted.id, sorted.order);
    this.init();
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
        <div data-element="body" class="sortable-table__body">
          ${this.getRows().join('')}
        </div>
      </div>
    `;
  }

  sort(field, sortDirection) {
    this.sortData(field, sortDirection);
    this.updateTable();
  }

  sortData(field, sortDirection) {
    const header = this.headerConfig.find(h => h.id === field);
    if (!header.sortable)
      return;

    this.data = this.sortValues(this.data, field, header.sortType, sortDirection);
    this.sortedField = header.id;
    this.sortDirection = sortDirection;
  }

  updateTable() {
    this.updateHeaders();
    this.subElements.body.innerHTML = this.getRows().join('');
  }

  updateHeaders() {
    const sortedHeader = this.subElements.header.querySelector(`[data-id=${this.sortedField}]`);
    sortedHeader.dataset.order = this.sortDirection;

    const arrow = this.subElements.arrow;
    arrow.remove();
    sortedHeader.append(arrow);
  }

  sortValues(arr, field, sortType = 'string', param = this.ASCSORT) {
    const sortDirection = param !== this.DESCSORT ? 1 : -1;
    const sortFunction = this.sortFunctions[sortType];
    return [...arr].sort(sortFunction(field, sortDirection));
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

  getRows() {
    return this.data.map(i => this.getRow(i));
  }
  
  getRow(item) {
    return `
      <a href="#" class="sortable-table__row">
        ${this.headerConfig.map(h => this.getCell(h, item)).join('')}
      </a>
    `;
  }

  getCell(header, item) {
    if (header.id === 'images') {
      return header.template(item);
    }

    return `<div class="sortable-table__cell">${item[header.id]}</div>`;
  }

  sortNumbers(field, direction) {
    return (a, b) => direction * (a[field] - b[field]);
  }

  sortStrings(field, direction) {
    return (a, b) => direction * a[field].localeCompare(b[field], 'ru-en', { caseFirst: 'upper' });
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
    this.subElements.header.addEventListener('pointerdown', event => {
      let cell = event.target.closest('.sortable-table__cell');

      if(!cell)
        return;

      const field = cell.dataset.id;
      this.sort(field, this.getSortDirection(field));
    });
  }

  getSortDirection(targetField) {
    if(this.sortedField !== targetField)
      return this.DESCSORT;

    if(this.sortDirection === this.ASCSORT)
      return this.DESCSORT;

    return this.ASCSORT;
  }

  destroy () {
    this.element?.remove();
    this.element = null;
  }
}
