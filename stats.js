function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
}

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}

// показать значение метрики за несколько день
function showMetricByPeriod(data, page, name, startDate, endDate) {
	let sampleData = data
		.filter(item => item.page == page && item.name == name && item.date >= startDate && item.date <= endDate)
		.map(item => item.value);

	console.log(`${startDate}—${endDate} ${name}: ` +
		`p25=${quantile(sampleData, 0.25)} p50=${quantile(sampleData, 0.5)} ` +
		`p75=${quantile(sampleData, 0.75)} p90=${quantile(sampleData, 0.95)} ` +
		`hits=${sampleData.length}`);
}

// показать сессию пользователя
function showSession(data, requestId, date) {
	let stringOut = `${date} sessionId=${requestId}`;
	let sampleData = data.filter(item => item.requestId == requestId && item.date == date);

	sampleData.forEach(function(sampleRow){
		stringOut += ` ${sampleRow.name}=${sampleRow.value}`;
	});

	stringOut += ` hits=${sampleData.length}`;
	console.log(stringOut);
}

// сравнить метрику в разных срезах
function compareMetric(data, page, parameter, name, date) {
	let finalData = {};
	let sampleData = data.filter(item => item.page == page && item.name == name && item.date == date);
	let stringOut = `${date} event=${name} parameter=${parameter}\n`;

	sampleData.forEach(function(sampleRow){
		if (finalData[sampleRow.additional[parameter]]) {
			finalData[sampleRow.additional[parameter]].push(sampleRow.value);
		} else {
			finalData[sampleRow.additional[parameter]] = [sampleRow.value];
		}
	});

	for (const finalDataKey in finalData) {
		stringOut += `${finalDataKey}: p25=${quantile(finalData[finalDataKey], 0.25)} p50=${quantile(finalData[finalDataKey], 0.5)} p75=${quantile(finalData[finalDataKey], 0.75)} p90=${quantile(finalData[finalDataKey], 0.95)} hits=${finalData[finalDataKey].length}\n`;
	}

	console.log(stringOut);
}

// рассчитать метрику за выбранный день
function calcMetricByDate(data, page, name, date) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);
	console.log(`${date} ${name}: ` +
		`p25=${quantile(sampleData, 0.25)} p50=${quantile(sampleData, 0.5)} ` +
		`p75=${quantile(sampleData, 0.75)} p90=${quantile(sampleData, 0.95)} ` +
		`hits=${sampleData.length}`);
}

fetch('https://shri.yandex/hw/stat/data?counterId=4F4BF570-FE0D-46A1-AB81-6651F29C2735')
	.then(res => res.json())
	.then(result => {
		let data = prepareData(result);

		calcMetricByDate(data, 'main', 'fcp', '2021-07-06');
		calcMetricByDate(data, 'main', 'fcp', '2021-07-07');
		calcMetricByDate(data, 'main', 'fcp', '2021-07-08');

		showMetricByPeriod(data, 'main', 'fcp', '2021-07-06', '2021-07-08');

		showSession(data, '880756679186', '2021-07-08');

		compareMetric(data, 'main', 'ip', 'fcp', '2021-07-0;');
	});
