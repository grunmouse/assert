let assert = require('assert');
	
assert.toleranceEqual = function(actual, expected, message){
	message = message || '';
	if(Math.abs(actual - expected) <= Number.EPSILON){
		//ok
	}
	else{
		message = message + ' Overerror: ' + Math.abs(actual - expected) / Number.EPSILON;
		throw new assert.AssertionError({
			actual,
			expected,
			operator: 'toleranceEqual',
			message
		});
	}
};

assert.deepToleranceEqual = function(actual, expected, message){
	try{
		switch(typeof actual){
			case 'number':
				assert.toleranceEqual(actual, expected);
				break;
			case 'object':
				if(actual){
					if(Array.isArray(actual)){
						assert.ok(Array.isArray(expected));
						for(let i = 0; i<actual.length; ++i){
							assert.deepToleranceEqual(actual[i], expected[i]);
						}
					}
					else{
						assert.ok(expected && typeof expected === 'object');
						for(let key in actual) if(actual.hasOwnProperty(key)){
							assert.deepToleranceEqual(actual[key], expected[key]);
						}
					}
				}
				else{
					assert.equal(actual, expected);
				}
				break;
			default:
				assert.equal(actual, expected);
				break;
		}
	}
	catch(e){
		if(e instanceof assert.AssertionError){
			throw new assert.AssertionError({
				message,
				actual,
				expected,
				operator: 'deepToleranceEqual'
			});
		}
		else{
			throw e;
		}
	}
}


module.exports = assert;