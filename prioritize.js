/**
 * Prioritizes promises
 *
 * @class
 * @mixins OO.EventEmitter
 *
 * @constructor
 */
OO.Prioritizer = function () {
	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.promise = null;
};

/* Setup */

OO.initClass( OO.Prioritizer );
OO.mixinClass( OO.Prioritizer, OO.EventEmitter );

/* Events */

/**
 * @event The priority promise has been resolved
 */

/**
 * @event The priority promise has been rejected
 */

/**
 * @event The priority promise has been reprioritized
 * @param {jQuery.Promise} promise Promise is being reprioritized
 */

/* Methods */

/**
 * Replaces the priority promise with a new one.
 *
 * @param {jQuery.Promise} promise Promise to prioritize
 */
OO.Prioritizer.prototype.prioritize = function ( promise ) {
	var prioritizer = this;

	if ( this.promise ) {
		this.emit( 'abort', this.promise );
	}
	this.promise = promise;
	promise.then(
		function () {
			if ( prioritizer.promise === promise ) {
				prioritizer.emit.apply( prioritizer, [ 'done' ].concat( arguments ) );
			}
		},
		function () {
			if ( prioritizer.promise === promise ) {
				prioritizer.emit.apply( prioritizer, [ 'fail' ].concat( arguments ) );
			}
		}
	);
};

/* Example */

function Thingy() {
	// Properties
	this.grabber = new OO.Prioritizer();

	// Events
	this.grabber.connect( this, {
		done: 'onGrabberDone',
		fail: 'onGrabberFail',
		abort: 'onGrabberAbort'
	} );
}

Thingy.prototype.grab = function ( value ) {
	var deferred = $.Deferred();

	setTimeout( function () {
		deferred.resolve( value );
	}, 100 );

	this.grabber.prioritize( deferred.promise() );
};

Thingy.prototype.onGrabberDone = function ( data ) {
	console.log( 'grab done:', data );
};

Thingy.prototype.onGrabberFail = function ( error ) {
	console.log( 'grab fail:', error );
};

Thingy.prototype.onGrabberAbort = function () {
	console.log( 'grab abort!' );
};

var thingy = new Thingy();

thingy.grab( 1 );
thingy.grab( 2 );
thingy.grab( 3 );
thingy.grab( 4 );
thingy.grab( 5 );
thingy.grab( 6 );
