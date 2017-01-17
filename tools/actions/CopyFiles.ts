
/// <reference path="../lib/types.d.ts" />

import utils = require('../lib/utils');
import Compiler = require('./Compiler');
import FileUtil = require('../lib/FileUtil');

var fileExtensionToIgnore = {
    "ts": true
};

export function copyToLibs() {
    var options = egret.args;
    var exitsModules = [];
    var moduleDir = FileUtil.joinPath(options.libsDir, 'modules');
    var list = FileUtil.getDirectoryListing(moduleDir);
    for (var i = 0; i < list.length; i++) {
        if (FileUtil.isDirectory(list[i])) {
            exitsModules.push(FileUtil.getRelativePath(moduleDir, list[i]));
        }
    }

    var properties = egret.args.properties;
    var modules = properties.getAllModuleNames();

    for (var tempK in modules) {
        var moduleName = modules[tempK];
        var modulePath = properties.getModulePath(moduleName);
        if (modulePath == null) {
            var moduleBin = FileUtil.joinPath(egret.root, "build", moduleName);
        }
        else {
            var tempModulePath = FileUtil.getAbsolutePath(modulePath);
            moduleBin = FileUtil.joinPath(tempModulePath, "bin", moduleName);

            //if (FileUtil.exists(FileUtil.joinPath(modulePath))) {
            //    moduleBin = FileUtil.joinPath(modulePath, "bin", moduleName);
            //}
            //else {
            //    moduleBin = FileUtil.joinPath(options.projectDir, modulePath, "bin", moduleName);
            //}
        }
        var targetFile = FileUtil.joinPath(options.libsDir, 'modules', moduleName);
        if (options.projectDir.toLowerCase() != egret.root.toLowerCase()) {
            FileUtil.copy(moduleBin, targetFile);
        }
        var index = exitsModules.indexOf(moduleName);
        if (index != -1) {
            exitsModules.splice(index, 1);
        }
    }
    var length = exitsModules.length;
    if (length > 0) {
        for (var i = 0; i < exitsModules.length; i++) {
            FileUtil.remove(FileUtil.joinPath(moduleDir, exitsModules[i]));
        }
    }
}

export function getLibsScripts() {
    var options = egret.args;
    var properties = egret.args.properties;
    var modules = properties.getAllModuleNames();
    var str = "";
    for (var tempK in modules) {
        var moduleName = modules[tempK];
        var debugJs = "";
        var releaseJs = "";

        var moduleReRoot = 'libs/modules/' + moduleName + "/";

        var jsDebugpath = FileUtil.joinPath(options.projectDir, moduleReRoot, moduleName + ".js");
        var jsReleasepath = FileUtil.joinPath(options.projectDir, moduleReRoot, moduleName + ".min.js");
        if (FileUtil.exists(jsDebugpath)) {
            debugJs = moduleReRoot + moduleName + ".js";
        }

        if (FileUtil.exists(jsReleasepath)) {
            releaseJs = moduleReRoot + moduleName + ".min.js";
        }

        if (debugJs == "") {
            debugJs = releaseJs;
        }
        if (releaseJs == "") {
            releaseJs = debugJs;
        }

        if (debugJs != "") {
            str += '\t<script egret="lib" src="' + debugJs + '" src-release="' + releaseJs + '"></script>\n';
        }

        debugJs = "";
        releaseJs = "";
        jsDebugpath = FileUtil.joinPath(options.projectDir, moduleReRoot, moduleName + ".web.js");
        jsReleasepath = FileUtil.joinPath(options.projectDir, moduleReRoot, moduleName + ".web.min.js");
        if (FileUtil.exists(jsDebugpath)) {
            debugJs = moduleReRoot + moduleName + ".web.js";
        }

        if (FileUtil.exists(jsReleasepath)) {
            releaseJs = moduleReRoot + moduleName + ".web.min.js";
        }

        if (debugJs == "") {
            debugJs = releaseJs;
        }
        if (releaseJs == "") {
            releaseJs = debugJs;
        }

        if (debugJs != "") {
            str += '\t<script egret="lib" src="' + debugJs + '" src-release="' + releaseJs + '"></script>\n';
        }
    }
    return str;
}

export function modifyHTMLWithModules() {
    var options = egret.args;
    var libsScriptsStr = getLibsScripts();
    var reg = /<!--modules_files_start-->[\s\S]*<!--modules_files_end-->/;
    var replaceStr = '<!--modules_files_start-->\n' + libsScriptsStr + '\t<!--modules_files_end-->';

    var list = FileUtil.getDirectoryListing(options.projectDir);
    for (var key in list) {
        var filepath = list[key];
        if (FileUtil.getExtension(filepath) == "html") {
            var htmlContent = FileUtil.read(filepath);

            htmlContent = htmlContent.replace(reg, replaceStr);
            FileUtil.save(filepath, htmlContent);
        }
    }
}
