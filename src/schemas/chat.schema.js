const yup = require('yup');

const chatParamsSchema = yup.object({
  id: yup
    .number()
    .typeError('Id de chat inválido')
    .integer('Id de chat inválido')
    .positive('Id de chat inválido')
    .required('Id de chat inválido'),
});

module.exports = {
  chatParamsSchema,
};
