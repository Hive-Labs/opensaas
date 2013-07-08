module.exports = function(grunt) {
  grunt.initConfig({
    meta: {
      banner: '/* The following software is property of Notoja corp built on <%= grunt.template.today() %>'
	},
	min: {
      dist: {
        src: ['<banner>'],
		dest: []
	  }
	},
	watch:{
      files: ['routes/*'],
	  tasks: ['min:dist']
	}
  });

  grunt.registerTask('default', [
    ''
  ]);
}
