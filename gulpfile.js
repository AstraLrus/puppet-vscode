// Include gulp
var es = require('event-stream');
var gulp = require('gulp');
var del = require('del');
var exec = require('child_process').exec;
var bump = require('gulp-bump');
var args = require('yargs').argv;
var download = require('gulp-downloader');
var decompress = require('gulp-decompress');
var path = require('path');

var vendoringConfig = undefined
function getVendoringConfiguration(sectionName) {
  if (vendoringConfig != undefined) { return vendoringConfig[sectionName]; }
  // Read the file and parse its contents.
  var fs = require('fs');

  filename = path.join(__dirname, 'editor-components.json');
  content = fs.readFileSync(filename, 'utf8');
  vendoringConfig = JSON.parse(content);

  return vendoringConfig[sectionName];
}

function getEditorServicesReleaseURL(config) {
  var githubuser = (config.githubuser == undefined) ? 'lingua-pupuli' : config.githubuser
  var githubrepo = (config.githubrepo == undefined) ? 'puppet-editor-services' : config.githubrepo
  var releasenumber = config.release;

  if (releasenumber == undefined) {
    throw "The name/number of the release must be set"
  };

  // Example URL https://github.com/lingua-pupuli/puppet-editor-services/releases/download/0.10.0/puppet_editor_services_0.10.0.zip
  return `https://github.com/${githubuser}/${githubrepo}/releases/download/${releasenumber}/puppet_editor_services_${releasenumber}.zip`;
};

function getEditorServicesGithubURL(config) {
  var githubuser = (config.githubuser == undefined) ? 'lingua-pupuli' : config.githubuser
  var githubrepo = (config.githubrepo == undefined) ? 'puppet-editor-services' : config.githubrepo
  var githubref = config.githubref;

  if (githubref == undefined) {
    throw "The git reference must be specified"
  };

  // Example URL - Branch
  // https://github.com/<owner>/puppet-editor-services/archive/add-code-action-provider.zip
  // Example URL - SHA ref
  // https://github.com/<owner>/puppet-editor-services/archive/1a2623217dbd8e0deed11808bba4ef8de8f3880d.zip
  return `https://github.com/${githubuser}/${githubrepo}/archive/${githubref}.zip`
};

gulp.task('clean', function () {
  return del(['vendor'])
});

gulp.task('vendor_editor_services', function (callback) {
  var fs = require('fs');

  vendorPath = path.join(__dirname, 'vendor');
  if (fs.existsSync(vendorPath)) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  }

  var config = getVendoringConfiguration("editor-services");

  // Use the github releases url if 'release' is defined
  if (config.release != undefined) {
    return download({
      fileName: 'editor_services.zip',
      request: {
        url: getEditorServicesReleaseURL(config)
      }
    })
    .pipe(decompress())
    .pipe(gulp.dest('./vendor/languageserver'));
  }

  // Use a custom github download if a github reference is defined
  if (config.githubref != undefined) {
    return download({
      fileName: 'editor_services.zip',
      request: {
        url: getEditorServicesGithubURL(config)
      }
    })
    .pipe(decompress({strip: 1}))
    .pipe(gulp.dest('./vendor/languageserver'));
  }

  // Use a simple filecopy if 'directory' is defined
  if (config.directory != undefined) {
    return gulp.src([path.join(config.directory,'lib/**/*'),
                     path.join(config.directory,'vendor/**/*'),
                     path.join(config.directory,'puppet-debugserver'),
                     path.join(config.directory,'puppet-languageserver'),
                     path.join(config.directory,'puppet-languageserver-sidecar')
                    ], { base: path.join(config.directory) })
              .pipe(gulp.dest('./vendor/languageserver'));
  }

  throw "Unable to vendor Editor Serices.  Missing a release, directory, or git reference configuration item"
});

gulp.task('compile_typescript', function (callback) {
  exec('tsc -p ./',
    function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      callback(err);
    });
})

gulp.task('bump', function () {
    /// <summary>
    /// It bumps revisions
    /// Usage:
    /// 1. gulp bump : bumps the package.json and bower.json to the next minor revision.
    ///   i.e. from 0.1.1 to 0.1.2
    /// 2. gulp bump --specific 1.1.1 : bumps/sets the package.json and bower.json to the
    ///    specified revision.
    /// 3. gulp bump --type major       : bumps 1.0.0
    ///    gulp bump --type minor       : bumps 0.1.0
    ///    gulp bump --type patch       : bumps 0.0.2
    ///    gulp bump --type prerelease  : bumps 0.0.1-2
    /// </summary>

    var type = args.type;
    var version = args.specific;
    var options = {};
    if (version) {
        options.version = version;
    } else {
        options.type = type;
    }

    return gulp
        .src(['package.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('.'));
});

// Vendor external resources into the extension
gulp.task('vendor', gulp.series('vendor_editor_services'));

// Build the extension
gulp.task('build',
  gulp.series('clean',
    gulp.series('vendor',
      gulp.series('compile_typescript',
      )
    )
  )
);

// The task called by VSCode editor before typescript is compiled)
gulp.task('initial', gulp.series('vendor'));

// The default task (called when you run `gulp` from cli)
gulp.task('default', gulp.series('build'));
