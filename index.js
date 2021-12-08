const express = require('express')
const app = express()
const {WebhookClient} = require('dialogflow-fulfillment'); 
const { default: axios } = require('axios');


app.get("/", function(req, res){
  res.send("chat gestión citas");
})

app.post('/', express.json(), (req,res)=>{
  const agent = new WebhookClient({
    request: req,
    response:res
  });

  
  async function  crearCita(agent){

    var usuario = {
      nombre : agent.parameters["nombre"],
      apellido : agent.parameters["apellido"],
      identificacionUsuario : agent.parameters["identificacionUsuario"],
      entidadServicios : agent.parameters["entidadServicios"],
      url : agent.parameters["url"],
      identificadorCita :Date.now(),
      estado :"En tramite"
    }
   
    axios.post("https://sheet.best/api/sheets/64f0fb14-aa5a-45b0-9d6f-7e5dea0fdee3", usuario);
    agent.add(" Tu proceso de registro de solicitud de cita se ha realizado con éxito, tu identificación de cita con la cual podrias consultar el estado es: " + usuario.identificadorCita + " hasta pronto.");
    
  }

  async function consultarCita(agent) {
    let identificadorCita = agent.parameters["identificadorCita"];
    console.log(identificadorCita);
      let resp = await axios.get("https://sheet.best/api/sheets/64f0fb14-aa5a-45b0-9d6f-7e5dea0fdee3/identificadorCita/"+identificadorCita);
      let tramites = resp.data;
      console.log(tramites);
      if (tramites.length > 0) {
        let tramite = tramites[0];  
        if(tramite.estado == "En tramite"){
          agent.add("El estado de asignación de tu cita es:" + tramite.estado + " hasta pronto ");
        }
        if(tramite.estado == "Asignada"){
          agent.add("Nombre especialista: " + tramite.nombreEspecialista + ", Fecha cita: " + tramite.fecha + ", Hora de la consulta: " + tramite.horaConsulta + " hasta pronto ")
        }
      }
      else {
        agent.add("El indentificador proporcionado no existe, hasta pronto");
      }
  }


  var intenMap = new Map();
  intenMap.set("crear cita", crearCita);
  intenMap.set("estado cita", consultarCita);
  agent.handleRequest(intenMap);

})


app.listen(process.env.PORT || 8000, ()=>{
    console.log("servidor ejecutandose en el puerto 8000")
});



