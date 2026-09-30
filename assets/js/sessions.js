/*
  Data-Class — session list
  --------------------------------------------------------
  Fill in `title` and `description` for each session.
  Cards with an empty title show as "Coming soon".
  `page` is the file each card opens (inside /sessions).
*/

const SESSIONS = Array.from({ length: 22 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    number: i + 1,
    title: "",
    description: "",
    page: `sessions/session-${n}.html`,
  };
});

SESSIONS[0].title = "Business Analytics and the Analytics Life Cycle";
SESSIONS[0].description = "Case studies, then the life cycle from discovery and data preparation to model building, quality assurance and documentation.";

SESSIONS[1].title = "Approval, Installation, Acceptance and Operation";
SESSIONS[1].description = "How an analytics project gets signed off, set up, accepted by users and kept running in production.";

SESSIONS[2].title = "Intelligent Data Analysis and Modern Analytic Tools";
SESSIONS[2].description = "The nature of data, analysis versus reporting, and the tools modern analytics teams use.";

SESSIONS[3].title = "Data Visualization and Data-Driven Decisions";
SESSIONS[3].description = "Exploring and visualizing data, then how Amazon, Netflix, Starbucks, Walmart and Uber decide with data.";

SESSIONS[4].title = "Descriptive Statistics";
SESSIONS[4].description = "Central tendency, dispersion, position and shape, worked through on a year of monthly sales.";

SESSIONS[5].title = "Sampling, Probability and Bayes' Theorem";
SESSIONS[5].description = "Samples and resampling, sample spaces and events, joint, marginal and conditional probability, and Bayes' theorem.";

SESSIONS[6].title = "Random Variables, Distributions and the Central Limit Theorem";
SESSIONS[6].description = "Random variables, PMFs and PDFs, the binomial, Poisson and normal distributions, and why sample means follow a bell curve.";

SESSIONS[7].title = "Sampling, Estimation and Statistical Inference";
SESSIONS[7].description = "Sampling methods, estimators and confidence intervals, hypothesis testing, errors and power, and choosing a test.";

SESSIONS[8].title = "Correlation, Covariance and Outliers";
SESSIONS[8].description = "Covariance, Pearson and Spearman correlation, why correlation isn't causation, and how to detect and handle outliers.";

SESSIONS[9].title = "Feature Selection, Hypothesis Testing and the Z-Test";
SESSIONS[9].description = "Filter, wrapper and embedded feature selection, and the hypothesis tests behind them, including the Z-test.";

SESSIONS[10].title = "Chi-Square Test, Information Gain and Skewness";
SESSIONS[10].description = "Goodness-of-fit and independence tests, entropy, information gain and mutual information, and measuring skewness.";

SESSIONS[11].title = "Predictive Modelling and Analysis";
SESSIONS[11].description = "Model types, the modelling workflow, overfitting, benefits, challenges, tools and the future of prediction.";

SESSIONS[12].title = "From Correlation to Supervised Segmentation";
SESSIONS[12].description = "Supervised segmentation, identifying informative attributes, progressive segmentation, and model induction and prediction.";

SESSIONS[13].title = "Supervised Segmentation, Tree Rules and Probability Estimation";
SESSIONS[13].description = "Building and visualizing segments, reading decision trees as if–then rules, and estimating probabilities from leaves.";

SESSIONS[14].title = "Prescriptive Modelling and Analytics";
SESSIONS[14].description = "From predicting to prescribing: optimization, simulation and decision analysis, how they work together, and real-world use cases.";

SESSIONS[15].title = "Regression Analysis and Forecasting Techniques";
SESSIONS[15].description = "Least-squares regression, R² and model assumptions, and qualitative, time series and causal forecasting methods.";

SESSIONS[16].title = "Simulation, Risk Analysis and Optimization";
SESSIONS[16].description = "Monte Carlo and other simulations, risk metrics like VaR, and linear and nonlinear optimization.";

SESSIONS[17].title = "Overfitting, Generalization and Model Evaluation";
SESSIONS[17].description = "Why models overfit, the bias–variance tradeoff, regularization and other remedies, and holdout vs. cross-validation.";

SESSIONS[18].title = "Decision Analytics, Classifier Evaluation and the Value of Data";
SESSIONS[18].description = "Decision trees for choices, confusion matrices, ROC and PR curves, analytical frameworks, evaluation, and return on data investment.";

SESSIONS[19].title = "Evidence, Probability and Probabilistic Reasoning";
SESSIONS[19].description = "Updating beliefs with Bayes' theorem, combining several pieces of evidence, dependent evidence, Bayesian networks and Markov models.";

SESSIONS[20].title = "Factor Analysis, Directional Data and Functional Data Analysis";
SESSIONS[20].description = "Latent factors behind correlated variables, circular statistics for angles and times of day, and analyzing whole curves.";

SESSIONS[21].title = "KNIME Analytics Platform";
SESSIONS[21].description = "Building no-code analytics workflows from nodes, running a full churn-prediction pipeline, and a recap of the whole course.";

/*
  Example of a filled-in session (replace entries like this later):

  SESSIONS[0].title = "Introduction to Data";
  SESSIONS[0].description = "What data is, where it comes from, and how we'll work with it.";
*/
