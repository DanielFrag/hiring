const chai = require('chai');
const path = require('path');
require('google-finance');
const googleFinancialMock = require('./mocks/google-finance');
require.cache[path.resolve(__dirname, '../node_modules/google-finance/index.js')].exports = googleFinancialMock;
const businessFinancial = require('../business/financial');
describe('Testes no módulo financeiro das regras de negócio', () => {
	it('Deve recuperar a última cotação de uma ação', async () => {
		const stock = 'PETR4.SA';
		const test = await businessFinancial.getRecentQuote(stock);
		chai.expect(test).exist;
		chai.expect(test.name).exist;
		chai.expect(test.name).to.be.a('string');
		chai.expect(test.name).to.be.equal(stock);
		chai.expect(test.lastPrice).exist;
		chai.expect(test.lastPrice).to.be.a('number');
		chai.expect(test.pricedAt).exist;
		chai.expect(test.pricedAt).to.be.a('string');
		chai.expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(test.pricedAt)).be.true;
	});
	it('Deve retornar vazio ao tentar recuperar a última cotação de uma ação inválida', async () => {
		const stock = 'UNKNOW.SA';
		const test = await businessFinancial.getRecentQuote(stock);
		chai.expect(test).not.exist;
	});
	it('Deve recuperar o histórico de preços de uma ação', async () => {
		const stock = 'PETR4.SA';
		const test = await businessFinancial.getHistoricalQuote(stock, '2018-01-01', '2018-01-27');
		chai.expect(test).exist;
		chai.expect(test.name).exist;
		chai.expect(test.name).to.be.a('string');
		chai.expect(test.name).to.be.equal(stock);
		chai.expect(test.prices).exist;
		chai.expect(Array.isArray(test.prices)).be.true;
		test.prices.forEach(element => {
			chai.expect(element.opening).exist;
			chai.expect(element.opening).to.be.a('number');
			chai.expect(element.low).exist;
			chai.expect(element.low).to.be.a('number');
			chai.expect(element.high).exist;
			chai.expect(element.high).to.be.a('number');
			chai.expect(element.closing).exist;
			chai.expect(element.closing).to.be.a('number');
			chai.expect(element.pricedAt).exist;
			chai.expect(element.pricedAt).to.be.a('string');
			chai.expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(element.pricedAt)).be.true;
		});
	});
	it('Deve retornar vazio ao tentar recuperar o histórico de preços de uma ação inválida', async () => {
		const stock = 'UNKNOW.SA';
		const test = await businessFinancial.getHistoricalQuote(stock, '2018-01-01', '2018-01-27');
		chai.expect(test).not.exist;
	});
	it('Deve recuperar os últimos preços de uma lista de ações (uma por vez), atentando para ações inválidas', async () => {
		const stocks = ['PETR4.SA', 'UNKNOW.SA', 'OIBR4.SA'];
		const tests = await businessFinancial.getStocksDataSerial(stocks);
		chai.expect(tests).exist;
		chai.expect(tests.lastPrices).exist;
		tests.lastPrices.forEach(test => {
			chai.expect(test).exist;
			chai.expect(test.name).exist;
			if (Object.keys(test).length > 1) {
				chai.expect(test.name).to.be.a('string');
				chai.expect(stocks.indexOf(test.name)).to.be.greaterThan(-1);
				chai.expect(test.lastPrice).exist;
				chai.expect(test.lastPrice).to.be.a('number');
				chai.expect(test.pricedAt).exist;
				chai.expect(test.pricedAt).to.be.a('string');
				chai.expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(test.pricedAt)).be.true;
			}
		});
	});
	it('Deve recuperar os últimos preços de uma lista de ações (em paralelo), atentando para ações inválidas', async () => {
		const stocks = ['PETR4.SA', 'UNKNOW.SA', 'OIBR4.SA'];
		const tests = await businessFinancial.getStocksDataParalel(stocks);
		chai.expect(tests).exist;
		chai.expect(tests.lastPrices).exist;
		tests.lastPrices.forEach(test => {
			chai.expect(test).exist;
			chai.expect(test.name).exist;
			if (Object.keys(test).length > 1) {
				chai.expect(test.name).to.be.a('string');
				chai.expect(stocks.indexOf(test.name)).to.be.greaterThan(-1);
				chai.expect(test.lastPrice).exist;
				chai.expect(test.lastPrice).to.be.a('number');
				chai.expect(test.pricedAt).exist;
				chai.expect(test.pricedAt).to.be.a('string');
				chai.expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(test.pricedAt)).be.true;
			}
		});
	});
	it('Deve projetar os ganhos de compra de uma ação', async () => {
		const stockName = 'PETR4.SA';
		const purchasedAmount = 100;
		const purchasedAt = '2018-01-01';
		const test = await businessFinancial.projectGains(stockName, purchasedAmount, purchasedAt);
		chai.expect(test).exist;
		chai.expect(test.name).exist;
		chai.expect(test.name).to.be.a('string');
		chai.expect(test.name).to.be.equal(stockName);
		chai.expect(test.purchasedAmount).exist;
		chai.expect(test.purchasedAmount).to.be.a('number');
		chai.expect(test.purchasedAmount).to.be.equal(purchasedAmount);
		chai.expect(test.purchasedAt).exist;
		chai.expect(test.purchasedAt).to.be.a('string');
		chai.expect(/^\d{4}-\d{2}-\d{2}$/.test(test.purchasedAt)).be.true;
		chai.expect(test.priceAtDate).exist;
		chai.expect(test.priceAtDate).to.be.a('number');
		chai.expect(test.lastPrice).exist;
		chai.expect(test.lastPrice).to.be.a('number');
		chai.expect(test.capitalGains).exist;
		chai.expect(test.capitalGains).be.equal(purchasedAmount * (test.lastPrice - test.priceAtDate));
	});
	it('Deve retornar vazio ao tentar projetar os ganhos de compra de uma ação inválida', async () => {
		const stockName = 'UNKNOW.SA';
		const purchasedAmount = 100;
		const purchasedAt = '2018-01-01';
		const test = await businessFinancial.projectGains(stockName, purchasedAmount, purchasedAt);
		chai.expect(test).not.exist;
	});
});