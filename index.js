console.log('Empieza el alta de vecinos')

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'})

exports.handler = function(event, context, callback){
    console.log('Procesando los datos del nuevo vecino: ' + JSON.stringify(event, null, 2))

    let date = new Date().getTime();
    
    let idFavor = Math.floor(100000 + Math.random() * 900000);
    
    let params =  {
        Item: {
            identificador_favor: idFavor,
            solicitante: event.nombre_usuario,
            estado: 'pendiente',
            descripcion_favor: event.descripcion,
            fecha_creacion: date
        },

        TableName: 'favores'
    };
    
    console.log('Vamos a dar de alta un nuevo favor del vecino: ' + params.Item.solicitante)
    console.log('El favor consiste en: ' + params.Item.descripcion_favor)

    docClient.put(params, function(err,data){
        if(err) {
            callback(err, null)
        }else{
            
            // Insertamos mensajes para que se generen los aviso
            console.log('Insertamos en la cola ');
            var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
            
            var parametros = {
               
              DelaySeconds: 10,
              MessageAttributes: {
                "idFavor": {
                  DataType: "String",
                  StringValue: idFavor.toString()
                }
              },
              MessageBody: "Generar avisos para este favor: " + idFavor,
 
              QueueUrl: "https://sqs.eu-west-1.amazonaws.com/278843471893/colaDeAvisos"
            };
            
            sqs.sendMessage(parametros, function(err, data) {
              if (err) {
                console.log("Error", err);
              } else {
                console.log("Success", data.MessageId);
              }
            });
            
            callback(null, data)
            
        }
    });
    

};
