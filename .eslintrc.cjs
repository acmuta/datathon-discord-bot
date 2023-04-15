module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
	plugins: ['@typescript-eslint'],
	root: true,
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
	},
};
