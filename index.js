const assert = require('assert');
const ApproxValue = require('./approx-value.js');

class ApproxException extends Error{
	constructor(approx, message){
		super(message || approx);
		this.approx = approx;
		this.name = "ApproxException";
	}
}

/**
 * Функция приблизительного сравнения с ограничением абсолютной погрешности
 */
function toleranceEqual(actual, expected, epsilon){
	let diff = Math.abs(actual - expected);
	if(Math.abs(actual - expected) <= epsilon){
		return new ApproxValue(expected, diff);
	}
	else{
		return false;
	}
}

/**
 * Функция приблизительного сравнения с ограничением относительной погрешности
 */
function approxEqual(actual, expected, depth){
	let scale = Math.abs(expected) || 1;
	let epsilon = depth/scale;
	return toleranceEqual(actual, expected, epsilon);
}


function assertable(equal){
	return function(actual, expected, depth, message){
		if(typeof depth !== 'number'){
			message = depth;
			depth = Number.EPSILON*2;
		}

		if(actual === expected || equal(actual, expected, depth)){
		}
		else{
			throw new assert.AssertionError({
				actual,
				expected,
				operator: 'toleranceEqual',
				message
			});
		}
	}
}

function tupleDeepPre(actual, expected, depth, equal){
	actual = [...actual];
	expected = [...expected];
	for(let i = 0; i<expected.length; ++i){
		if(typeof expected[i] === 'number' && typeof actual[i] === 'number'){
			if(actual[i] === expected[i]){
				continue;
			}
			let d;
			if(Array.isArray(depth)){
				d = depth[i];
			}
			else if(typeof depth === 'number'){
				d = depth;
			}
			let res = equal(actual[i], expected[i], depth);
			if(res instanceof ApproxValue){
				actual[i] = res;
				expected[i] = res;
			}
		}
		else if(Array.isArray(expected) && Array.isArray(actual)){
			let d;
			if(Array.isArray(depth)){
				d = depth[i];
			}
			else if(typeof depth === 'number'){
				d = depth;
			}
			let res = tupleDeepPre(actual[i], expected[i], d, equal);
			actual[i] = res.actual;
			expected[i] = res.expected;
		}
	}
	
	return {
		actual,
		expected
	};
}

function assertableTuple(equal){
	return function(actual, expected, depth, message){
		if(typeof depth !== 'number' && !Array.isArray(depth)){
			message = depth;
			depth = Number.EPSILON*2;
		}
		let prep = tupleDeepPre(actual, expected, depth, equal);
		
		assert.deepEqual(prep.actual, prep.expected, message);
	};
}

assert.approxEqual = assertable(approxEqual);

assert.approxTupleEqual = assertableTuple(approxEqual);


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