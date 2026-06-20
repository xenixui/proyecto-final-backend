const yup = require('yup');

const chatParamsSchema = yup.object({
  id: yup
    .number()
    .typeError('Id de chat inválido')
    .integer('Id de chat inválido')
    .positive('Id de chat inválido')
    .required('Id de chat inválido'),
});


 const createChatSchema = yup.object({
  fk_articles_id: yup
    .number()
    .typeError('fk_articles_id debe ser un número')
    .integer('fk_articles_id debe ser un número entero')
    .positive('fk_articles_id debe ser un número positivo')
    .required('fk_articles_id es obligatorio')
 })

module.exports = {
  chatParamsSchema,
  createChatSchema
};

