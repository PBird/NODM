// nedb generate type definition
npx tsc datastore.js cursor.js utils.js --declaration --allowJs --emitDeclarationOnly


TODO: 
    fork @seald/nedb and make it generate type files. 
    Make cursor fields protected

    /**
     * @protected
     */
    _protectedMember = "I am protected";
