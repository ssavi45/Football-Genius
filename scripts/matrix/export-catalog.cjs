const { load } = require('./load-ts.cjs');
process.stdout.write(JSON.stringify(load('@/lib/matrix/criteria.ts').criteriaCatalog));
