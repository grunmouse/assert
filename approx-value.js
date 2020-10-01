const util = require('util');

class ApproxValue{
	constructor(value, accuracy){
		this.value = value;
		this.accuracy = accuracy;
	}
	[util.inspect.custom](depth, options){
		const newOptions = Object.assign({}, options, {
			depth: options.depth === null ? null : options.depth - 1
		});
		let val = util.inspect(this.value, newOptions);
		let acc = util.inspect(this.accuracy, newOptions);
		let title = options.stylize('ApproxValue', 'special');
		let pm = options.stylize(' ± ', 'special');
		
		return title + '< '+val + pm + acc +' >';
	}
}

module.exports = ApproxValue;