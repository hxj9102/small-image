#!/usr/bin/env node

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs')
const path = require('path')

const exclude = ['node_modeles']

const cmdMap = {
	overwrite: '-o', // default
	build: '-b'
}

const type = process.argv[2]
const compressDir = process.argv[3]

let startPath = process.cwd()

if (compressDir) {
	startPath = path.join(startPath, compressDir)
}

let outputPath

if (type === cmdMap.build) {
	outputPath = path.join(path.resolve(startPath, '..'), 'build')
} else {
	outputPath = startPath
}

class CompressImg {
	constructor (startPath) {
		this.status = 0
		this.finder(startPath, outputPath)
	}

	finder(startPath, outputPath) {
		const files = fs.readdirSync(startPath)
		this.compress(startPath.replace(/\\/g, '/'), outputPath)
		files.forEach((val, index) => {
			const fPath = path.join(startPath, val)
			const stats = fs.statSync(fPath)
			if (stats.isDirectory() && !exclude.includes(val)) {
				this.finder(fPath.replace(/\\/g, '/'), path.join(outputPath, val))
			}
		})
	}

	async compress (startPath, outputPath) {
		const files = await imagemin([`${startPath}/*.{jpg,jpeg,png}`], {
			destination: `${outputPath}`,
			plugins: [
				imageminJpegtran({
					quality: [0.6, 0.8]
				}),
				imageminPngquant({
					quality: [0.6, 0.8]
				})
			]
		})
		files && files.forEach(file => {
			fs.writeFileSync(file.destinationPath, file.data)
			console.log(`small ${file.destinationPath}`)
		})
	}
}

new CompressImg(startPath)
