module.exports = {
	root: true,
	env: {
		commonjs: true,
		es2021: true,
		node: true
	},
	extends: ["eslint:recommended"],
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: "latest",
		sourceType: "module"
	},
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			plugins: ["@typescript-eslint"],
			extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
			parser: "@typescript-eslint/parser"
		}
	]
}
