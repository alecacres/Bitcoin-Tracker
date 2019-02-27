****var modules = [];
var currency;
var today = new Date();

var cookies = {

	getItem: function (sKey) {
		if (!sKey)
			return null;

		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},

	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey))
	    	return false;

	    var sExpires = "";

	    if (vEnd) {
	    	switch (vEnd.constructor) {
	    		case Number:
	        		sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
	        		break;
	        	case String:
	          		sExpires = "; expires=" + vEnd;
	          		break;
	        	case Date:
	          		sExpires = "; expires=" + vEnd.toUTCString();
	          		break;
	    	}
	    }
	    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	    return true;
	},

	removeItem: function (sKey, sPath, sDomain) {
	    if (!this.hasItem(sKey))
	    	return false;

	    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
	    return true;
	},

	hasItem: function (sKey) {
	    if (!sKey)
	    	return false;

	    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},

	keys: function () {
	    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);

	    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
	    	aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
	    }
	    return aKeys;

	}
};

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

function createModule() {
	var id = modules.length;
	var data = {
		received: false,
		updated: false,
		settings: {
			month: '',
			day: '',
			year: '',
			balance: ''
		},
		values: {
			revenue: '',
			dailyRevenue: '',
			percent: '',
			dailyPercent: ''
		}
	}
	var module = document.createElement('div');
	module.id = 'module-' + id;
	module.classList.add('module');
	document.getElementById('modules').append(module);
	modules.push(data);
	makeFront(id);
}

function makeFront(id) {
	var valuesTemplate = document.getElementById('values-template').innerHTML;
	var module = document.getElementById('module-' + id);
	var container = document.createElement('div');

	clearModule(id);

	container.classList.add('container');
	container.innerHTML = valuesTemplate;
	module.append(container);
	module.getElementsByClassName('settings')[0].addEventListener('click', makeBack);
	module.getElementsByClassName('exit')[0].addEventListener('click', deleteModule);


	if (hasValues(id)) {
		module.getElementsByClassName('revenue')[0].innerHTML = '$' + round(modules[id].values.revenue, 2);
		module.getElementsByClassName('daily-revenue')[0].innerHTML = '$' + round(modules[id].values.dailyRevenue, 2);
		module.getElementsByClassName('percent')[0].innerHTML = round(modules[id].values.percent, 1) + '%';
		module.getElementsByClassName('daily-percent')[0].innerHTML = round(modules[id].values.dailyPercent, 1) + '%';
	} else if (hasSettings(id)) {
		update();
	}
}

function makeFrontEvent(event) {
	var id = event.target.parentNode.parentNode.parentNode.id.replace('module-', '');

	makeFront(id);
}

function makeBack(event) {
	var id = event.target.parentNode.parentNode.id.replace('module-', '');

	var settingsTemplate = document.getElementById('settings-template').innerHTML;
	var module = document.getElementById('module-' + id);
	var container = document.createElement('div');

	clearModule(id);

	container.classList.add('container');
	container.innerHTML = settingsTemplate;
	module.append(container);
	module.getElementsByClassName('save')[0].addEventListener('click', saveSettings);
	module.getElementsByClassName('cancel')[0].addEventListener('click', makeFrontEvent);

	if (hasSettings(id)) {
		module.getElementsByClassName('month')[0].value = modules[id].settings.month;
		module.getElementsByClassName('day')[0].value = modules[id].settings.day;
		module.getElementsByClassName('year')[0].value = modules[id].settings.year;
		module.getElementsByClassName('balance')[0].value = modules[id].settings.balance;
	}
}

function saveSettings(id) {
	var moduleId = id.replace('module-', '');

	modules[moduleId].settings.month = document.getElementById(id).getElementsByClassName('month')[0].value;
	modules[moduleId].settings.day = document.getElementById(id).getElementsByClassName('day')[0].value;
	modules[moduleId].settings.year = document.getElementById(id).getElementsByClassName('year')[0].value;
	modules[moduleId].settings.balance = document.getElementById(id).getElementsByClassName('balance')[0].value;

	// cookies.setItem(id + '-month', );
	// cookies.setItem(id + '-day', );
	// cookies.setItem(id + '-year', );
	// cookies.setItem(id + '-balance', );

	makeFront(moduleId);
}

function saveSettingsEvent(event) {
	var id = event.target.parentNode.parentNode.parentNode.id;
	saveSettings(id);
}

function clearModule(id) {
	document.getElementById('module-' + id).children.remove();
}

function deleteModule(event) {
	var id = event.target.parentNode.parentNode.id.replace('module-', '');
	modules[id].deleted = true;
	document.getElementById('module-' + id).remove();
}

function round(number, decimalPlace) {
	var multiplier = Math.pow(10, decimalPlace);
	return Math.round((number + 0.00001) * multiplier) / multiplier;
}

function hasSettings(id) {
	var m = modules[id].settings;
	return m.month && m.day && m.year && m.balance;
}

function hasValues(id) {
	var m = modules[id].values;
	return m.revenue && m.dailyRevenue && m.percent && m.dailyPercent;
}

function getCurrency() {
	currency = document.getElementById('currency').value;
	// cookies.setItem('currency', currency, )
	update();
}

function update() {
	var todayMS = new Date(Date.now());
	var todayAPI = 'http://api.coindesk.com/v1/bpi/currentprice/' + currency + '.json';
	var todayRequest = new XMLHttpRequest();
	var todayPrice;
	var todayReceived = false;
	var online = navigator.onLine;

	if (online) {
		todayRequest.open('GET', todayAPI, true);
		todayRequest.onreadystatechange = function () {
		    if (todayRequest.readyState === XMLHttpRequest.DONE && todayRequest.status >= 200 && todayRequest.status < 400) {
				todayPrice = JSON.parse(todayRequest.responseText);
				todayPrice = parseFloat(todayPrice.bpi[currency].rate.replace(/,/g, ''));
				todayReceived = true;
				document.getElementById('price').innerHTML = '$' + round(todayPrice, 2);

				modules.forEach(function(module, id) {
					if (hasSettings(id) && !module.deleted && module.received) {
						var date = module.settings.year + '-' + module.settings.month + '-' + module.settings.day;
						var dateMS = new Date(module.settings.year, module.settings.month - 1, module.settings.day);
						var daysPassed = (todayMS - dateMS) / 86400000;
						var balance = module.settings.balance;
				    	var m = document.getElementById('module-' + id);
				    	try {
							var previousPrice = JSON.parse(module.request.responseText);
				    	} catch (error) {
					    	console.log(module.request.responseText);
				    	}

						module.received = false;
						previousPrice = parseFloat(previousPrice.bpi[date]);
						module.values.revenue = (todayPrice - previousPrice) * balance;
						module.values.dailyRevenue = module.values.revenue / daysPassed;
						module.values.percent = module.values.revenue / (previousPrice * balance) * 100;
						module.values.dailyPercent = module.values.percent / daysPassed;

						m.getElementsByClassName('revenue')[0].innerHTML = '$' + round(modules[id].values.revenue, 2);
						m.getElementsByClassName('daily-revenue')[0].innerHTML = '$' + round(modules[id].values.dailyRevenue, 2);
						m.getElementsByClassName('percent')[0].innerHTML = round(modules[id].values.percent, 1) + '%';
						m.getElementsByClassName('daily-percent')[0].innerHTML = round(modules[id].values.dailyPercent, 1) + '%';
					}
				});
			} else if (todayRequest.readyState === XMLHttpRequest.DONE) {
				console.error('A request for the current bitcoin price returned a server error.');
			}
		}
		todayRequest.onerror = function () {
			console.error('A request for the current bitcoin price resulted in a connection error.');
		}
		todayRequest.send();

		modules.forEach(function(module, id) {
			if (hasSettings(id) && !module.deleted) {
				var date = module.settings.year + '-' + module.settings.month + '-' + module.settings.day;
				var previousAPI = 'http://api.coindesk.com/v1/bpi/historical/close.json?currency=' + currency + '&start=' + date + '&end=' + date;
				module.request = new XMLHttpRequest();

				module.request.open('GET', previousAPI, true);
				module.request.onreadystatechange = function () {
				    if (module.request.readyState === XMLHttpRequest.DONE && module.request.status >= 200 && module.request.status < 400) {
				    	if (todayReceived) {
							var dateMS = new Date(module.settings.year, module.settings.month - 1, module.settings.day);
							var daysPassed = (todayMS - dateMS) / 86400000;
							var balance = module.settings.balance;
					    	var m = document.getElementById('module-' + id);
					    	try {
								var previousPrice = JSON.parse(module.request.responseText);
					    	} catch (error) {
						    	console.log(module.request.responseText);
					    	}

							previousPrice = parseFloat(previousPrice.bpi[date]);
							module.values.revenue = (todayPrice - previousPrice) * balance;
							module.values.dailyRevenue = module.values.revenue / daysPassed;
							module.values.percent = module.values.revenue / (previousPrice * balance) * 100;
							module.values.dailyPercent = module.values.percent / daysPassed;

							m.getElementsByClassName('revenue')[0].innerHTML = '$' + round(modules[id].values.revenue, 2);
							m.getElementsByClassName('daily-revenue')[0].innerHTML = '$' + round(modules[id].values.dailyRevenue, 2);
							m.getElementsByClassName('percent')[0].innerHTML = round(modules[id].values.percent, 1) + '%';
							m.getElementsByClassName('daily-percent')[0].innerHTML = round(modules[id].values.dailyPercent, 1) + '%';

						} else {
							module.received = true;
						}
					} else if (module.request.readyState === XMLHttpRequest.DONE) {
						console.error('A request for a previous bitcoin price returned a server error.');
					}
				}
				module.request.onerror = function () {
					console.error('A request for a previous bitcoin price resulted in a connection error.');
				}
				module.request.send();
			}
		});
	}
}

function init() {
	// var savedCurrency = cookies.getItem('currency');

	if (savedCurrency)
		currency = savedCurrency;
	else
		getCurrency;

	document.getElementById('currency').val = currency;
}

window.onload = init;
document.getElementById('currency').addEventListener('change', getCurrency);
window.setInterval(update, 30000);

cookies.setItem('currency', 'USD', );
console.log(cookies.getItem('currency'));
