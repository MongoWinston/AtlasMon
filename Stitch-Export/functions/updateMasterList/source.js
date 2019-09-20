exports = function(changeEvent) {
  var doc = changeEvent.fullDocument;
  var conn = context.services.get("mongodb-atlas").db("atlasmonitor").collection("clusters");
  
  for(var p = 0; p < doc.projects.length; p++) {
    var cList = doc.projects[p].clustersResponse.results;
    for(var c = 0; c < cList.length; c++) {
      var newdoc = {};
      newdoc.noReap = false;
      newdoc.name = cList[c].name;
      newdoc.project = doc.projects[p].name;
      newdoc.projectId = doc.projects[p].id;
      newdoc.created = new Date();
      newdoc.updated = new Date();
      newdoc.autoGenerated = true;
      newdoc.numShards = cList[c].numShards;
      newdoc.replicationFactor = cList[c].replicationFactor;
      newdoc.size = cList[c].providerSettings.instanceSizeName;

      try {
        conn.insertOne(newdoc);
      } catch (e) {
        return true;
      }
      conn.updateOne({name:newdoc.name, project:newdoc.project}, {$set:{reaped:cList[c].paused}});
    }
  }
  
};
