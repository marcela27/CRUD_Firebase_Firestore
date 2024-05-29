const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const helpers = require("handlebars-helpers")();
const bodyParser = require("body-parser");

var PORT = 8081;

const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");

const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const serviceAccount = require("./Firebase-Rafael");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.engine("handlebars", handlebars({ defaultLayout: "main", helpers: helpers }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render("primeira_pagina");
});

app.get("/consulta", async function (req, res) {
    const dataSnapshot = await db.collection('agendamentos').get();
    const data = [];
    dataSnapshot.forEach((doc) => {
        data.push({
            id: doc.id,
            nome: doc.get('nome'),
            telefone: doc.get('telefone'),
            origem: doc.get('origem'),
            data_contato: doc.get('data_contato'),
            observacao: doc.get('observacao'),
        });
    });
    res.render("consulta", { data });
});

app.get("/editar/:id", async function (req, res) {
    const dataSnapshot = await db.collection('agendamentos').doc(req.params.id).get();
    const data = {
        id: dataSnapshot.id,
        nome: dataSnapshot.get('nome'),
        telefone: dataSnapshot.get('telefone'),
        origem: dataSnapshot.get('origem'),
        data_contato: dataSnapshot.get('data_contato'),
        observacao: dataSnapshot.get('observacao'),
    };

    res.render("editar", { data });
});

app.get("/excluir/:id", function (req, res) {
    db.collection('agendamentos').doc(req.params.id).delete().then(function () {
        console.log('Deleted document');
        res.redirect('/consulta');
    });
});

app.post("/cadastrar", function (req, res) {
  var result = db
    .collection("agendamentos")
    .add({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao,
    })
    .then(function () {
      console.log("Added document");
      res.redirect("/");
    });
});

app.post("/atualizar", function (req, res) {
    var result = db
      .collection("agendamentos")
      .doc(req.body.id)
      .update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao,
      })
      .then(function () {
        console.log("Updated document");
        res.redirect("/consulta");
      });
});



app.listen(PORT, function () {
  console.log("Servidor ativo na porta: " + PORT);
});
