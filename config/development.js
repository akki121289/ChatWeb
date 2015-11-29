module.exports = {
	address: '127.0.0.1',
	port: '3000',
	mongodbAddress: 'mongodb://localhost/chatweb',
	plugins: {
		yar: {
		    register: require('yar'),
			    options: {
			    storeBlank: true,
			    cookieOptions: {
			        password: 'password',
			        isSecure: false
			    }
			}
		},
		good: {
		    register: require('good'),
			    options: {
		        reporters: [{
		            reporter: require('good-console'),
		            events: {
		                response: '*',
		                log: '*'
		            }
		        }]
		    }
		},
		jade: {
		        engines: {
		            jade: require('jade')
		        },
		        relativeTo: __dirname,
		        path: '../views'
		}
	}
}