/**
 * @fileoverview Cloud Functions para a aplicação KdRacha.
 * @description Este ficheiro contém as funções de backend seguro.
 */

const functions = require("firebase-functions");

// A sua chave secreta do Stripe
const stripeSecretKey =
  "sk_test_51S5TkQF2TTQzZJeBuRFmsuNEy9wqLakevZyExVrOpLjksFzNOh349Gd" +
  "ch8oXmF8SYxwKF2158aGGtDkWmoktvWVV00CQQTZ9Pd";
const stripe = require("stripe")(stripeSecretKey);

/**
 * Cria uma Intenção de Pagamento no Stripe.
 */
// --- CORREÇÃO FINAL DE SINTAXE ---
// Removemos a chamada .region() para ser compatível com a sua versão da
// biblioteca firebase-functions. A função será implementada na região padrão.
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "O utilizador deve estar autenticado para criar um pagamento.",
    );
  }

  const {amount} = data;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "O valor do pagamento é inválido.",
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "brl",
      payment_method_types: ["card"],
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Erro ao criar PaymentIntent:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Não foi possível iniciar o pagamento.",
    );
  }
});

