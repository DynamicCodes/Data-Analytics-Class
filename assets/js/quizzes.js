/* Data-Class — end-of-session quizzes.
   10 questions per session. o = options, a = index of the correct option, e = explanation.
   Generated from quiz_src.py; edit questions there and regenerate, or edit here directly. */
window.QUIZZES = {
 "1": [
  {
   "q": "Which type of analytics answers the question “What should we do?”",
   "o": [
    "Descriptive",
    "Prescriptive",
    "Predictive",
    "Diagnostic"
   ],
   "a": 1,
   "e": "Prescriptive analytics combines descriptive and predictive insight to recommend the best action."
  },
  {
   "q": "A dashboard summarizing last quarter's sales by region is an example of…",
   "o": [
    "Descriptive analytics",
    "Predictive analytics",
    "Prescriptive analytics",
    "Simulation"
   ],
   "a": 0,
   "e": "Descriptive analytics summarizes historical data to show what happened; most reports and dashboards are descriptive."
  },
  {
   "q": "What does predictive analytics mainly rely on?",
   "o": [
    "Management intuition alone",
    "Only the most recent transaction",
    "Manual data entry by analysts",
    "Statistical models and machine learning applied to historical data"
   ],
   "a": 3,
   "e": "Predictive analytics fits statistical or machine learning models to historical data to forecast future outcomes."
  },
  {
   "q": "Which is the correct order of the data analytics life cycle?",
   "o": [
    "Model building → discovery → documentation → data preparation → quality assurance → model planning",
    "Data preparation → documentation → discovery → model planning → model building → quality assurance",
    "Discovery → data preparation → model planning → model building → quality assurance → documentation",
    "Quality assurance → model planning → discovery → model building → data preparation → documentation"
   ],
   "a": 2,
   "e": "Each phase feeds the next: understand the problem, prepare data, plan and build the model, check it, then document it."
  },
  {
   "q": "What is the main focus of the discovery phase?",
   "o": [
    "Tuning the model's hyperparameters",
    "Framing the business problem, identifying data sources and forming initial hypotheses",
    "Writing the final project report",
    "Deploying the model to production"
   ],
   "a": 1,
   "e": "Discovery is about understanding the business problem and the data available before any modelling starts."
  },
  {
   "q": "Which task belongs to the data preparation phase?",
   "o": [
    "Removing duplicates and handling missing values",
    "Presenting findings to executives",
    "Choosing the business objective",
    "Signing the project contract"
   ],
   "a": 0,
   "e": "Data preparation cleans and transforms raw data so it is fit for modelling."
  },
  {
   "q": "Why is data split into training, validation and test sets?",
   "o": [
    "To make the dataset smaller and faster to store",
    "Because regulators require three separate files",
    "To remove outliers automatically",
    "To estimate how the model will perform on data it has never seen"
   ],
   "a": 3,
   "e": "The model learns from training data, is tuned on validation data, and is judged fairly on untouched test data."
  },
  {
   "q": "In the loan-default classifier, raising the decision threshold usually…",
   "o": [
    "Increases recall but lowers precision",
    "Increases both precision and recall",
    "Increases precision but lowers recall",
    "Has no effect on either"
   ],
   "a": 2,
   "e": "A higher threshold flags fewer loans, so flags are more often right (precision) but more defaulters are missed (recall)."
  },
  {
   "q": "What is the purpose of the quality assurance phase?",
   "o": [
    "To collect more raw data",
    "To verify that results are accurate, reliable and meet requirements before release",
    "To decide the colors of the dashboard",
    "To recruit new analysts"
   ],
   "a": 1,
   "e": "Quality assurance checks the model and outputs against requirements so problems are caught before anyone relies on them."
  },
  {
   "q": "Why does careful documentation matter in an analytics project?",
   "o": [
    "It makes results reproducible and lets others understand and maintain the work",
    "It replaces the need for testing",
    "It is only needed for legal disputes",
    "It makes the model run faster"
   ],
   "a": 0,
   "e": "Documented data sources, methods and assumptions let others reproduce, audit and build on the analysis."
  }
 ],
 "2": [
  {
   "q": "How does management approval work in an analytics project?",
   "o": [
    "A single sign-off after the project ends",
    "Only a budget approval at the start",
    "Formal sign-off at several gates throughout the project",
    "Optional, if the analysts agree"
   ],
   "a": 2,
   "e": "Approval happens at gates from initiation to deployment, and each gate must be cleared before the next stage."
  },
  {
   "q": "Which of these is NOT a reason approval matters?",
   "o": [
    "It aligns the project with strategic goals",
    "It guarantees the model will be 100% accurate",
    "It formally authorizes budget, tools and people",
    "It helps meet regulatory and privacy requirements"
   ],
   "a": 1,
   "e": "Approval provides alignment, resources, risk control, compliance and accountability, but it can't guarantee accuracy."
  },
  {
   "q": "Why must approval gates be cleared in order?",
   "o": [
    "Each gate depends on decisions made at the previous one",
    "Because the gates are listed alphabetically",
    "Because project software requires it",
    "The order doesn't actually matter"
   ],
   "a": 0,
   "e": "Later decisions, such as deployment, rest on earlier ones, such as the approved objectives and data access."
  },
  {
   "q": "What is the main goal of proper installation?",
   "o": [
    "More attractive dashboards",
    "Avoiding the need for documentation",
    "Replacing version control",
    "An analytics environment that runs smoothly, compatibly and reproducibly"
   ],
   "a": 3,
   "e": "A consistent, documented setup prevents version conflicts and lets teams reproduce analyses reliably."
  },
  {
   "q": "Git, GitHub and GitLab belong to which category of tools?",
   "o": [
    "ETL and pipelines",
    "Data warehouses",
    "Version control",
    "Visualization and BI"
   ],
   "a": 2,
   "e": "Version control tracks changes to code, and increasingly to data and models, so work can be traced and rolled back."
  },
  {
   "q": "Snowflake, Amazon Redshift and Google BigQuery are examples of…",
   "o": [
    "Visualization tools",
    "Data warehouses",
    "Version control systems",
    "NoSQL databases"
   ],
   "a": 1,
   "e": "They are cloud data warehouses that store large volumes of structured data for analysis."
  },
  {
   "q": "What is user acceptance testing (UAT)?",
   "o": [
    "End users check that the solution meets their real requirements",
    "Automated unit tests written by developers",
    "A universal analytics toolkit",
    "A file-transfer protocol"
   ],
   "a": 0,
   "e": "In UAT, the people who will use the solution test it against the agreed acceptance criteria."
  },
  {
   "q": "When should acceptance criteria be agreed?",
   "o": [
    "After deployment",
    "Only if UAT fails",
    "They are never written down",
    "At the beginning of the project"
   ],
   "a": 3,
   "e": "Agreeing criteria up front means everyone knows what “done” looks like before the work starts."
  },
  {
   "q": "A production model's accuracy drifts below its alert threshold. What should happen?",
   "o": [
    "Ignore it until users complain",
    "Delete the dashboard",
    "Investigate the drift and retrain the model on recent data",
    "Reinstall all the software"
   ],
   "a": 2,
   "e": "Operation includes monitoring; when data changes and performance drops, the model is reviewed and retrained."
  },
  {
   "q": "Why version datasets, models and dashboards?",
   "o": [
    "To increase storage costs",
    "To trace and reproduce any past result and roll back safely",
    "Because spreadsheets require it",
    "To hide changes from reviewers"
   ],
   "a": 1,
   "e": "Versioning records exactly which data and model produced each result, so it can be reproduced or reverted."
  }
 ],
 "3": [
  {
   "q": "What is intelligent data analysis (IDA)?",
   "o": [
    "Producing monthly spreadsheets by hand",
    "Designing computer hardware",
    "Storing data in a warehouse",
    "Applying AI, machine learning and statistical methods to extract knowledge from complex data"
   ],
   "a": 3,
   "e": "IDA goes beyond summaries, using learning and reasoning to find patterns and insight automatically."
  },
  {
   "q": "Blood group is an example of which kind of data?",
   "o": [
    "Quantitative continuous",
    "Quantitative discrete",
    "Qualitative (categorical)",
    "Semi-structured"
   ],
   "a": 2,
   "e": "Blood group describes a category, not a measured quantity."
  },
  {
   "q": "The number of clinic visits a patient makes is…",
   "o": [
    "Quantitative continuous",
    "Quantitative discrete",
    "Qualitative",
    "Unstructured"
   ],
   "a": 1,
   "e": "Visits are counted in whole numbers, so the data is discrete."
  },
  {
   "q": "Hospital records reused later for a research study are…",
   "o": [
    "Secondary data",
    "Primary data",
    "Unstructured by definition",
    "Experimental data"
   ],
   "a": 0,
   "e": "Secondary data was collected earlier for another purpose; primary data is collected for the study itself."
  },
  {
   "q": "JSON and XML files are typically…",
   "o": [
    "Structured",
    "Unstructured",
    "Qualitative",
    "Semi-structured"
   ],
   "a": 3,
   "e": "They have partial structure through tags or keys, but not fixed rows and columns."
  },
  {
   "q": "If the target variable is categorical (such as “healed / not healed”), which kind of algorithm fits?",
   "o": [
    "Regression",
    "Normalization",
    "Classification",
    "Time series smoothing"
   ],
   "a": 2,
   "e": "Categorical targets point to classification; numeric targets point to regression."
  },
  {
   "q": "How does analysis differ from reporting?",
   "o": [
    "Reporting explains causes; analysis only lists figures",
    "Reporting shows what happened; analysis explains why and what to do",
    "They are the same thing",
    "Reporting is always predictive"
   ],
   "a": 1,
   "e": "Reporting organizes and summarizes data; analysis digs into it to explain causes and guide decisions."
  },
  {
   "q": "What does the feature selection and extraction step do?",
   "o": [
    "Identifies the most relevant variables for the analysis",
    "Collects the raw data",
    "Presents the final insight",
    "Deletes all outliers"
   ],
   "a": 0,
   "e": "Choosing or constructing the most informative variables improves models and makes them easier to interpret."
  },
  {
   "q": "Tableau and Power BI are primarily…",
   "o": [
    "Relational databases",
    "Programming languages",
    "Version control systems",
    "Visualization and business intelligence tools"
   ],
   "a": 3,
   "e": "They turn data into interactive charts and dashboards for exploring and communicating results."
  },
  {
   "q": "Why should you understand the nature of data before analyzing it?",
   "o": [
    "It is a legal requirement",
    "It only matters for storage",
    "It determines which algorithms, preprocessing and interpretations are appropriate",
    "AI makes it unnecessary"
   ],
   "a": 2,
   "e": "Data type, structure and quality shape every later choice, from encoding to model selection."
  }
 ],
 "4": [
  {
   "q": "What is the main purpose of exploring data before modelling?",
   "o": [
    "To understand its structure and detect problems and patterns",
    "To deploy the final model",
    "To present results to the board",
    "To replace data cleaning"
   ],
   "a": 0,
   "e": "Exploration reveals variable types, missing values, outliers and relationships that guide the modelling."
  },
  {
   "q": "Which chart best shows how a value changes over time?",
   "o": [
    "Pie chart",
    "Scatter plot",
    "Heatmap",
    "Line chart"
   ],
   "a": 3,
   "e": "A line chart connects values in time order, making trends and seasonality easy to see."
  },
  {
   "q": "Which chart best shows the relationship between two numeric variables?",
   "o": [
    "Pie chart",
    "Bar chart",
    "Scatter plot",
    "Histogram"
   ],
   "a": 2,
   "e": "Each point is one observation plotted by both variables, revealing correlation, clusters and outliers."
  },
  {
   "q": "Which chart shows the distribution of a single numeric variable?",
   "o": [
    "Pie chart",
    "Histogram",
    "Line chart",
    "Scatter plot"
   ],
   "a": 1,
   "e": "A histogram groups values into bins and shows how many fall in each."
  },
  {
   "q": "What does a box plot display?",
   "o": [
    "The median, quartiles and outliers",
    "Each category's share of the total",
    "A trend over time",
    "A correlation matrix"
   ],
   "a": 0,
   "e": "The box spans the middle 50% of the data, the line is the median, and points beyond the whiskers are outliers."
  },
  {
   "q": "What is cross-tabulation used for?",
   "o": [
    "Measuring correlation between numeric variables",
    "Drawing maps",
    "Cleaning duplicate records",
    "Comparing categorical variables against each other"
   ],
   "a": 3,
   "e": "A cross-tab counts how often each combination of categories occurs."
  },
  {
   "q": "What is the first step of data-driven decision making?",
   "o": [
    "Collect relevant data",
    "Analyze the data",
    "Define the business problem",
    "Evaluate outcomes"
   ],
   "a": 2,
   "e": "Without a clear decision area, you can't know which data to collect or which analysis matters."
  },
  {
   "q": "What is the last of the seven steps of data-driven decision making?",
   "o": [
    "Implement the decision",
    "Evaluate the outcomes and refine the strategy",
    "Clean and prepare the data",
    "Define the business problem"
   ],
   "a": 1,
   "e": "Measuring impact closes the loop, so the next decision is better informed."
  },
  {
   "q": "In Uber's dynamic pricing, what happens when rider demand rises relative to available drivers?",
   "o": [
    "Prices rise, attracting more drivers and balancing supply and demand",
    "Prices fall to attract riders",
    "Nothing changes",
    "All rides are cancelled"
   ],
   "a": 0,
   "e": "Surge pricing uses real-time demand data to rebalance the market."
  },
  {
   "q": "How does data-driven stocking respond to an event like a heatwave?",
   "o": [
    "It keeps stock fixed regardless",
    "It closes the affected stores",
    "It raises prices on every product",
    "It adjusts stock of affected products to match forecast demand"
   ],
   "a": 3,
   "e": "Walmart-style stocking uses demand signals to prevent both shortages and waste."
  }
 ],
 "5": [
  {
   "q": "For the data 2, 3, 3, 5, 12, which measure is least affected by the outlier 12?",
   "o": [
    "Mean",
    "Median",
    "Range",
    "Variance"
   ],
   "a": 1,
   "e": "The median depends only on the middle value (3); the mean, range and variance are all pulled by 12."
  },
  {
   "q": "The coefficient of variation (CV) is calculated as…",
   "o": [
    "Standard deviation ÷ mean × 100%",
    "Mean ÷ standard deviation",
    "Variance squared",
    "Range ÷ number of observations"
   ],
   "a": 0,
   "e": "CV expresses spread relative to the mean, so datasets on different scales can be compared."
  },
  {
   "q": "Monthly sales have a CV of about 10%. What does this suggest?",
   "o": [
    "Demand is extremely volatile",
    "Sales are falling",
    "The data must be wrong",
    "Demand is fairly stable and predictable"
   ],
   "a": 3,
   "e": "A spread of about 10% of the mean indicates consistent month-to-month sales."
  },
  {
   "q": "The interquartile range (IQR) is…",
   "o": [
    "Maximum − minimum",
    "Median − mean",
    "Q3 − Q1",
    "Q2 − Q1"
   ],
   "a": 2,
   "e": "The IQR covers the middle 50% of the data and ignores the extremes."
  },
  {
   "q": "In a right (positively) skewed distribution…",
   "o": [
    "The mean is less than the median",
    "The mean is greater than the median",
    "The mean equals the median",
    "There is no tail"
   ],
   "a": 1,
   "e": "A long right tail pulls the mean toward the high values."
  },
  {
   "q": "What does kurtosis describe?",
   "o": [
    "How heavy the tails are, or how peaked the distribution is",
    "The center of the data",
    "The direction of the skew",
    "The number of observations"
   ],
   "a": 0,
   "e": "High kurtosis means heavy tails and more extreme values than a normal distribution."
  },
  {
   "q": "When calculating a sample variance, the sum of squared deviations is divided by…",
   "o": [
    "n",
    "n + 1",
    "√n",
    "n − 1"
   ],
   "a": 3,
   "e": "Dividing by n − 1 corrects the bias from estimating the mean from the same sample."
  },
  {
   "q": "What is the 90th percentile?",
   "o": [
    "The average of the top 10 values",
    "90% of the mean",
    "The value below which 90% of the observations fall",
    "0.9 × the maximum"
   ],
   "a": 2,
   "e": "Percentiles describe position: 90% of the data is at or below the 90th percentile."
  },
  {
   "q": "What is the main weakness of the range as a measure of spread?",
   "o": [
    "It is hard to calculate",
    "It depends only on the two extreme values, so outliers distort it",
    "It is always zero",
    "It uses every data point"
   ],
   "a": 1,
   "e": "One unusual value can make the range misleadingly large."
  },
  {
   "q": "The sales case found an average of about ₹585k a month with a CV of about 10%. Which plan fits?",
   "o": [
    "Plan steady inventory with modest safety stock",
    "Treat demand as chaotic and unforecastable",
    "Hold no stock at all",
    "Plan for sales to double next month"
   ],
   "a": 0,
   "e": "A stable average with low relative spread supports steady planning, with safety stock sized from the dispersion."
  }
 ],
 "6": [
  {
   "q": "What do μ and x̄ represent?",
   "o": [
    "μ is the sample mean; x̄ is the population mean",
    "Both are sample means",
    "μ is the population mean; x̄ is the sample mean",
    "Both are population means"
   ],
   "a": 2,
   "e": "Greek letters describe population parameters; x̄ is the statistic calculated from a sample to estimate μ."
  },
  {
   "q": "What is the main risk of convenience sampling?",
   "o": [
    "It is too expensive",
    "Bias: the sample may not represent the population",
    "It is mathematically impossible",
    "It always gives perfect estimates"
   ],
   "a": 1,
   "e": "Picking whoever is easiest to reach can systematically over- or under-represent groups."
  },
  {
   "q": "What is bootstrapping?",
   "o": [
    "Repeatedly resampling the data with replacement to estimate variability",
    "Leaving out one observation at a time",
    "Splitting the data into k folds",
    "Shuffling labels to test significance"
   ],
   "a": 0,
   "e": "Each bootstrap sample recomputes the statistic; their spread estimates its uncertainty."
  },
  {
   "q": "What does the jackknife do?",
   "o": [
    "Resamples with replacement",
    "Splits into training and test folds",
    "Adds random noise to the data",
    "Recomputes a statistic leaving out one observation at a time"
   ],
   "a": 3,
   "e": "Leave-one-out estimates reveal how much each observation influences the result."
  },
  {
   "q": "Two events are mutually exclusive when…",
   "o": [
    "They always occur together",
    "They are independent",
    "They cannot occur together, so P(A ∩ B) = 0",
    "Their probabilities add to more than 1"
   ],
   "a": 2,
   "e": "Rolling a 1 and rolling a 6 on one die are mutually exclusive."
  },
  {
   "q": "For any two events, P(A ∪ B) equals…",
   "o": [
    "P(A) + P(B)",
    "P(A) + P(B) − P(A ∩ B)",
    "P(A) × P(B)",
    "P(A) − P(B)"
   ],
   "a": 1,
   "e": "Subtracting the overlap avoids counting outcomes in both events twice."
  },
  {
   "q": "The conditional probability P(A | B) is…",
   "o": [
    "P(A ∩ B) ÷ P(B)",
    "P(A) × P(B)",
    "P(B | A)",
    "P(A) + P(B)"
   ],
   "a": 0,
   "e": "Given that B happened, we look only within B and ask how much of it is also A."
  },
  {
   "q": "Events A and B are independent when…",
   "o": [
    "P(A ∩ B) = 0",
    "P(A) = P(B)",
    "P(A | B) = 0",
    "P(A ∩ B) = P(A) × P(B)"
   ],
   "a": 3,
   "e": "Independence means knowing B doesn't change the probability of A."
  },
  {
   "q": "A disease affects 1% of people. A test catches 99% of cases and gives 1% false positives. After a positive test, P(disease) is about…",
   "o": [
    "99%",
    "1%",
    "50%",
    "90%"
   ],
   "a": 2,
   "e": "Among 10,000 people, about 99 true positives and 99 false positives: half of positives are real."
  },
  {
   "q": "Which of these is NOT an axiom of probability?",
   "o": [
    "P(A) ≥ 0 for every event",
    "P(A) ≥ P(B) whenever A happens before B",
    "P(S) = 1 for the whole sample space",
    "P(A ∪ B) = P(A) + P(B) for mutually exclusive events"
   ],
   "a": 1,
   "e": "The three axioms are non-negativity, total probability 1, and additivity for mutually exclusive events."
  }
 ],
 "7": [
  {
   "q": "What is a random variable?",
   "o": [
    "A randomly chosen sample",
    "A constant",
    "A type of chart",
    "A function that assigns a number to each outcome of a random experiment"
   ],
   "a": 3,
   "e": "For a coin toss, X(H) = 1 and X(T) = 0 turns outcomes into numbers."
  },
  {
   "q": "For a continuous random variable, the probability of any single exact value is…",
   "o": [
    "1",
    "The value of the PDF at that point",
    "0",
    "0.5"
   ],
   "a": 2,
   "e": "Probabilities are areas under the curve, and a single point has zero width."
  },
  {
   "q": "The probabilities in a probability mass function (PMF) must…",
   "o": [
    "Add up to 0",
    "Add up to 1",
    "Each exceed 1",
    "All be equal"
   ],
   "a": 1,
   "e": "The outcomes cover every possibility, so their probabilities sum to 1."
  },
  {
   "q": "For a binomial distribution with n = 3 and p = 0.5, P(X = 2) is…",
   "o": [
    "0.375",
    "0.25",
    "0.5",
    "0.125"
   ],
   "a": 0,
   "e": "C(3, 2) × 0.5² × 0.5 = 3 × 0.125 = 0.375."
  },
  {
   "q": "For a Poisson distribution, the mean and variance are…",
   "o": [
    "λ and λ²",
    "np and np(1 − p)",
    "μ and σ²",
    "Both equal to λ"
   ],
   "a": 3,
   "e": "One parameter, λ, gives both the average count and its variance."
  },
  {
   "q": "Which distribution best models the number of calls to a help desk per hour?",
   "o": [
    "Binomial",
    "Normal",
    "Poisson",
    "Uniform"
   ],
   "a": 2,
   "e": "Poisson counts events in a fixed interval when they occur independently at an average rate."
  },
  {
   "q": "For a normal distribution, roughly what share of values lie within ±2 standard deviations of the mean?",
   "o": [
    "68%",
    "95%",
    "99.7%",
    "50%"
   ],
   "a": 1,
   "e": "The 68–95–99.7 rule: about 95% of values lie within 2σ."
  },
  {
   "q": "When does a Poisson distribution approximate a binomial one well?",
   "o": [
    "When n is large and p small, with np = λ",
    "When n is small and p = 0.5",
    "When p is close to 1",
    "Never"
   ],
   "a": 0,
   "e": "Many trials each with a rare success behave like a Poisson count."
  },
  {
   "q": "What does the central limit theorem say about sample means for large n?",
   "o": [
    "They are normal only if the population is normal",
    "They are only normal for uniform populations",
    "They follow the population's shape exactly",
    "They are approximately normal, whatever the population's shape"
   ],
   "a": 3,
   "e": "That is why normal-based inference works so widely."
  },
  {
   "q": "A population has σ = 10. What is the standard error of the mean for samples of n = 36?",
   "o": [
    "10",
    "0.28",
    "1.67",
    "6"
   ],
   "a": 2,
   "e": "Standard error = σ ÷ √n = 10 ÷ 6 ≈ 1.67."
  }
 ],
 "8": [
  {
   "q": "What is stratified sampling?",
   "o": [
    "Dividing the population into groups and sampling randomly from each",
    "Selecting every k-th item from a list",
    "Picking entire clusters at random",
    "Choosing whoever is easiest to reach"
   ],
   "a": 0,
   "e": "Stratifying guarantees each group, such as juniors and seniors, is fairly represented."
  },
  {
   "q": "Which of these is a non-probability sampling method?",
   "o": [
    "Simple random sampling",
    "Systematic sampling",
    "Cluster sampling",
    "Quota sampling"
   ],
   "a": 3,
   "e": "Quota sampling fills fixed numbers per group, but not at random, so it can be biased."
  },
  {
   "q": "An estimator is unbiased when…",
   "o": [
    "It uses the smallest sample possible",
    "It always gives the exact answer",
    "Its expected value equals the true parameter",
    "It has the largest variance"
   ],
   "a": 2,
   "e": "On average across many samples it hits the target, though any single estimate can miss."
  },
  {
   "q": "An estimator is consistent when…",
   "o": [
    "It gives the same answer for every sample",
    "It becomes more accurate as the sample size grows",
    "It is unbiased even with n = 1",
    "It uses the median"
   ],
   "a": 1,
   "e": "Consistency means the estimate converges on the true value with more data."
  },
  {
   "q": "With σ = ₹12,800 and n = 50, what is the 95% margin of error for the mean salary?",
   "o": [
    "About ₹3,548",
    "About ₹1,820",
    "₹12,800",
    "About ₹256"
   ],
   "a": 0,
   "e": "1.96 × 12,800 ÷ √50 ≈ 1.96 × 1,810 ≈ ₹3,548."
  },
  {
   "q": "What is the correct interpretation of a 95% confidence interval?",
   "o": [
    "There is a 95% chance μ is in this particular interval",
    "95% of individuals fall within the interval",
    "The interval contains 95% of the sample",
    "The method captures the true mean in about 95% of repeated samples"
   ],
   "a": 3,
   "e": "The confidence is in the procedure; once computed, a given interval either contains μ or doesn't."
  },
  {
   "q": "If the sample size increases from 50 to 200, the margin of error…",
   "o": [
    "Doubles",
    "Stays the same",
    "Halves",
    "Falls to a quarter"
   ],
   "a": 2,
   "e": "Margin of error scales with 1 ÷ √n, and √(200 ÷ 50) = 2."
  },
  {
   "q": "What is a Type I error?",
   "o": [
    "Failing to reject a false null hypothesis",
    "Rejecting a null hypothesis that is actually true",
    "Using the wrong sample",
    "Choosing the wrong test"
   ],
   "a": 1,
   "e": "Its probability is α, the significance level."
  },
  {
   "q": "In the rod example, Z = −2.08 in a two-tailed test at α = 0.05. What is the decision?",
   "o": [
    "Reject H₀, because |Z| exceeds 1.96",
    "Fail to reject H₀",
    "Accept H₁ with certainty",
    "The test is invalid"
   ],
   "a": 0,
   "e": "The statistic falls in the rejection region: the mean length differs significantly from 50 cm."
  },
  {
   "q": "Which test checks whether preferred product is related to region (both categorical)?",
   "o": [
    "Z-test",
    "t-test",
    "F-test",
    "Chi-square test"
   ],
   "a": 3,
   "e": "Chi-square tests independence between categorical variables."
  }
 ],
 "9": [
  {
   "q": "What does the sign of the covariance tell you?",
   "o": [
    "Its strength on a standard scale",
    "The direction of the relationship",
    "Whether one variable causes the other",
    "Whether there are outliers"
   ],
   "a": 1,
   "e": "Positive covariance means the variables rise together; negative means one falls as the other rises."
  },
  {
   "q": "Why is Pearson's r preferred over covariance for comparing strength?",
   "o": [
    "r is unit-free and always between −1 and +1",
    "Covariance can never be negative",
    "r is always larger",
    "Covariance needs ranked data"
   ],
   "a": 0,
   "e": "Covariance changes with units (₹ vs ₹1000); r stays the same."
  },
  {
   "q": "In the advertising example (X = 2, 3, 5; Y = 40, 50, 80), Pearson's r is about…",
   "o": [
    "0.5",
    "−0.9",
    "31.67",
    "0.996"
   ],
   "a": 3,
   "e": "r = 31.67 ÷ (1.53 × 20.82) ≈ 0.996: a nearly perfect positive relationship. (31.67 is the covariance.)"
  },
  {
   "q": "When is Spearman's rank correlation preferred over Pearson's?",
   "o": [
    "When data is perfectly linear and normal",
    "When both variables are unordered categories",
    "When the relationship is monotonic but not linear, or data is ordinal or has outliers",
    "Never"
   ],
   "a": 2,
   "e": "Spearman works on ranks, so it captures any consistently rising or falling pattern and resists outliers."
  },
  {
   "q": "Ice cream sales and drownings are strongly correlated. What's the right conclusion?",
   "o": [
    "Ice cream causes drowning",
    "A confounding variable, hot weather, drives both",
    "It's only coincidence",
    "They are negatively related"
   ],
   "a": 1,
   "e": "Correlation isn't causation; removing temperature's effect leaves almost no relationship."
  },
  {
   "q": "If Cov(X, Y) = 0, what can you conclude?",
   "o": [
    "There's no linear relationship, but the variables aren't necessarily independent",
    "The variables are always independent",
    "They are perfectly correlated",
    "The data contains an error"
   ],
   "a": 0,
   "e": "Zero covariance rules out a linear relationship only; a curved dependence can still exist."
  },
  {
   "q": "What are the IQR outlier fences?",
   "o": [
    "Mean ± 1 standard deviation",
    "Median ± IQR",
    "The minimum and maximum",
    "Q1 − 1.5 × IQR and Q3 + 1.5 × IQR"
   ],
   "a": 3,
   "e": "Values beyond these fences are flagged, which is how box plots mark outliers."
  },
  {
   "q": "For the heights 150, 151, 152, 153, 155 and 210 cm, the median is…",
   "o": [
    "153 cm",
    "161.8 cm",
    "152.5 cm",
    "155 cm"
   ],
   "a": 2,
   "e": "With six values the median is the average of the middle two: (152 + 153) ÷ 2."
  },
  {
   "q": "Why can a Z-score rule miss an outlier in a small sample?",
   "o": [
    "Z-scores ignore the mean",
    "The outlier inflates the standard deviation it's judged against",
    "Z-scores only work on normal data",
    "It can't; Z-scores never miss outliers"
   ],
   "a": 1,
   "e": "The modified Z-score, based on the median and MAD, avoids this masking."
  },
  {
   "q": "An outlier turns out to be a data-entry typo. What should you do?",
   "o": [
    "Correct or remove it",
    "Keep it as a key insight",
    "Square it",
    "Duplicate it"
   ],
   "a": 0,
   "e": "Removal suits genuine errors; real but extreme values may instead be capped, transformed or investigated."
  }
 ],
 "10": [
  {
   "q": "How do filter methods select features?",
   "o": [
    "By training a model on every subset",
    "During model training via penalties",
    "By ranking them with statistical tests, independent of any model",
    "At random"
   ],
   "a": 2,
   "e": "Filters use correlation, chi-square, ANOVA or mutual information scores; they are fast and model-agnostic."
  },
  {
   "q": "What is the main limitation of filter methods?",
   "o": [
    "They are extremely slow",
    "They look at one feature at a time, ignoring interactions",
    "They require a trained model",
    "They can't use p-values"
   ],
   "a": 1,
   "e": "Two features may carry the same information, or only matter together; filters can't see that."
  },
  {
   "q": "How does forward selection work?",
   "o": [
    "Start with no features and add the most helpful one at a time",
    "Start with all features and remove the weakest",
    "Shrink coefficients toward zero",
    "Pick features at random"
   ],
   "a": 0,
   "e": "It stops when adding another feature no longer improves validation performance."
  },
  {
   "q": "What does LASSO (L1) regularization do?",
   "o": [
    "Keeps every feature with smaller weights",
    "Increases all coefficients",
    "Only works with decision trees",
    "Shrinks some coefficients exactly to zero, removing those features"
   ],
   "a": 3,
   "e": "That is why LASSO is an embedded feature selection method."
  },
  {
   "q": "How does Ridge (L2) regularization differ from LASSO?",
   "o": [
    "It removes features entirely",
    "It is a tree-based method",
    "It shrinks all coefficients but keeps them non-zero",
    "It is a filter method"
   ],
   "a": 2,
   "e": "Ridge tames large coefficients and multicollinearity but doesn't select features."
  },
  {
   "q": "Which test checks a numeric feature against a two-class target (such as churn yes/no)?",
   "o": [
    "Chi-square test",
    "t-test",
    "Pearson correlation of categories",
    "F-test of two variances"
   ],
   "a": 1,
   "e": "Compare the feature's mean in the two groups; ANOVA gives the same result for two groups."
  },
  {
   "q": "Which test checks two categorical variables for a relationship?",
   "o": [
    "Chi-square test of independence",
    "t-test",
    "Pearson correlation",
    "Z-test"
   ],
   "a": 0,
   "e": "It compares observed counts in a cross-table with the counts expected under independence."
  },
  {
   "q": "Churners pay ₹742 on average (n = 64) against a company mean of ₹700 with σ = ₹150. What is Z?",
   "o": [
    "0.28",
    "1.96",
    "42",
    "2.24"
   ],
   "a": 3,
   "e": "Z = (742 − 700) ÷ (150 ÷ √64) = 42 ÷ 18.75 = 2.24."
  },
  {
   "q": "If the p-value is less than or equal to α, you…",
   "o": [
    "Accept H₀",
    "Conclude the effect is large",
    "Reject H₀",
    "Conclude H₁ is certainly true"
   ],
   "a": 2,
   "e": "A small p-value means data this extreme would be unlikely if H₀ were true."
  },
  {
   "q": "What is the recommended practical order for feature selection?",
   "o": [
    "Run wrappers on every feature first",
    "Filter out irrelevant features, refine with wrapper or embedded methods, then validate",
    "Skip validation",
    "Use embedded methods only"
   ],
   "a": 1,
   "e": "Cheap filters narrow the field; model-based methods fine-tune; cross-validation confirms the result."
  }
 ],
 "11": [
  {
   "q": "A die is rolled to test fairness with a chi-square goodness-of-fit test. How many degrees of freedom?",
   "o": [
    "6",
    "1",
    "60",
    "5"
   ],
   "a": 3,
   "e": "df = k − 1 = 6 − 1 = 5."
  },
  {
   "q": "In a test of independence, how is each expected count calculated?",
   "o": [
    "Row total ÷ column total",
    "Observed count × 2",
    "Row total × column total ÷ grand total",
    "Grand total ÷ number of cells, always"
   ],
   "a": 2,
   "e": "It is the count expected if the two variables were unrelated."
  },
  {
   "q": "How many degrees of freedom does a 2 × 3 contingency table have?",
   "o": [
    "6",
    "2",
    "5",
    "1"
   ],
   "a": 1,
   "e": "df = (rows − 1)(columns − 1) = 1 × 2 = 2."
  },
  {
   "q": "The chi-square test assumes each expected frequency is at least…",
   "o": [
    "5",
    "1",
    "30",
    "0.5"
   ],
   "a": 0,
   "e": "Smaller expected counts make the p-value unreliable; combine categories or use an exact test."
  },
  {
   "q": "What is the entropy of a 50/50 yes/no split?",
   "o": [
    "0 bits",
    "0.5 bits",
    "2 bits",
    "1 bit"
   ],
   "a": 3,
   "e": "An even split is maximum uncertainty for a two-way outcome."
  },
  {
   "q": "Information gain is calculated as…",
   "o": [
    "H(Y | X) − H(Y)",
    "H(X) × H(Y)",
    "H(Y) − H(Y | X)",
    "1 − H(Y)"
   ],
   "a": 2,
   "e": "It is how much knowing feature X reduces uncertainty about Y."
  },
  {
   "q": "In the tennis example, which real feature would a decision tree split on first?",
   "o": [
    "Wind",
    "Weather",
    "Day number",
    "Neither; it would not split"
   ],
   "a": 1,
   "e": "Weather's gain (0.247) far exceeds Wind's (0.048); Day number only looks good because every value is unique."
  },
  {
   "q": "What is information gain biased toward?",
   "o": [
    "Features with many distinct values, such as IDs",
    "Binary features",
    "Numeric features only",
    "Nothing; it is unbiased"
   ],
   "a": 0,
   "e": "The gain ratio corrects some of this bias, and ID-like columns should be removed."
  },
  {
   "q": "A positively skewed distribution has…",
   "o": [
    "A long left tail, with the mean below the median",
    "A perfectly symmetric shape",
    "Mean equal to mode",
    "A long right tail, with the mean above the median"
   ],
   "a": 3,
   "e": "Extreme high values pull the mean to the right."
  },
  {
   "q": "How can strong right skew be reduced before a test that assumes normality?",
   "o": [
    "Square the values",
    "Add more outliers",
    "Apply a log or square-root transformation",
    "Nothing can reduce it"
   ],
   "a": 2,
   "e": "These transforms compress large values more than small ones."
  }
 ],
 "12": [
  {
   "q": "In Y = f(X) + ε, what does ε represent?",
   "o": [
    "Random error that no model can explain",
    "The model itself",
    "The predictors",
    "The intercept"
   ],
   "a": 0,
   "e": "A good model captures f without trying to fit ε."
  },
  {
   "q": "Predicting whether a customer will buy (yes/no) is a…",
   "o": [
    "Regression problem",
    "Clustering problem",
    "Time series problem",
    "Classification problem"
   ],
   "a": 3,
   "e": "The output is a category, not a number."
  },
  {
   "q": "K-means is an example of…",
   "o": [
    "Supervised classification",
    "Regression",
    "Clustering (unsupervised grouping)",
    "An ensemble method"
   ],
   "a": 2,
   "e": "It groups similar items without a target variable."
  },
  {
   "q": "A model has low training error but high test error. This is…",
   "o": [
    "Underfitting",
    "Overfitting",
    "A good fit",
    "Data leakage in the test set"
   ],
   "a": 1,
   "e": "The model memorized noise in the training data instead of the real pattern."
  },
  {
   "q": "When does a majority-vote ensemble improve most on a single model?",
   "o": [
    "When its models make different, independent errors",
    "When all its models are identical",
    "When it contains only one model",
    "When the models' errors are perfectly correlated"
   ],
   "a": 0,
   "e": "Diverse errors cancel out in the vote; shared errors don't."
  },
  {
   "q": "In exponential smoothing, a smoothing factor α close to 1…",
   "o": [
    "Averages over a very long history",
    "Ignores the data",
    "Adds seasonality automatically",
    "Reacts quickly to the most recent value"
   ],
   "a": 3,
   "e": "Forecast = α × latest actual + (1 − α) × previous forecast."
  },
  {
   "q": "What does a simple exponential smoothing forecast look like for future months?",
   "o": [
    "A rising trend",
    "A seasonal wave",
    "Flat: the same value for every future period",
    "Random noise"
   ],
   "a": 2,
   "e": "It has no trend or seasonal term; Holt's and Holt–Winters methods add those."
  },
  {
   "q": "A regression model has R² = 0.9. What does that mean?",
   "o": [
    "90% of predictions are exactly right",
    "It explains 90% of the variation in the target",
    "The error is always 10%",
    "The correlation is 0.9"
   ],
   "a": 1,
   "e": "R² is the share of variance explained."
  },
  {
   "q": "In the predictive modelling workflow, which step comes right after model training?",
   "o": [
    "Model evaluation",
    "Problem definition",
    "Data collection",
    "Nothing; training is the last step"
   ],
   "a": 0,
   "e": "The model is evaluated with metrics like accuracy, R² or RMSE before deployment."
  },
  {
   "q": "Which is a genuine limitation of predictive models?",
   "o": [
    "They are always too easy to interpret",
    "They need no data",
    "They are always unbiased",
    "They can't anticipate unprecedented events like COVID-19"
   ],
   "a": 3,
   "e": "Models learn from history, so truly new situations fall outside what they know."
  }
 ],
 "13": [
  {
   "q": "How does supervised segmentation differ from clustering?",
   "o": [
    "It uses no data",
    "It is guided by a known target variable",
    "It assigns groups randomly",
    "It only works on images"
   ],
   "a": 1,
   "e": "Segments are formed to differ in the outcome, such as churn, not just in similarity."
  },
  {
   "q": "In a gains chart, what does a curve bowing far above the diagonal indicate?",
   "o": [
    "The model separates high-risk from low-risk cases well",
    "The model is random",
    "The model is overfitting",
    "The data has errors"
   ],
   "a": 0,
   "e": "Targeting the top-scored cases first captures most positives quickly."
  },
  {
   "q": "How is a segment's lift calculated?",
   "o": [
    "Overall rate ÷ segment rate",
    "Segment size",
    "Model accuracy",
    "Segment's outcome rate ÷ overall rate"
   ],
   "a": 3,
   "e": "A lift of 3× means the segment's churn rate is three times the average."
  },
  {
   "q": "Which pair of attributes is redundant?",
   "o": [
    "Income and credit score",
    "Tenure and support calls",
    "Age and years since birth",
    "Contract type and region"
   ],
   "a": 2,
   "e": "They carry identical information, so one should be dropped."
  },
  {
   "q": "What is a constant attribute?",
   "o": [
    "One that is mostly missing",
    "One with the same value in every row",
    "A unique ID for each row",
    "One highly correlated with another"
   ],
   "a": 1,
   "e": "Country = “India” for every applicant can't help distinguish outcomes."
  },
  {
   "q": "Progressive attributive segmentation splits first on…",
   "o": [
    "The most informative attribute",
    "Attributes in alphabetical order",
    "A random attribute",
    "The least informative attribute"
   ],
   "a": 0,
   "e": "Then each segment is refined with the next most informative attribute."
  },
  {
   "q": "When should progressive segmentation stop splitting?",
   "o": [
    "After exactly ten splits",
    "Never",
    "As soon as region is available",
    "When segments get too small or a split adds little information"
   ],
   "a": 3,
   "e": "Tiny or barely-different segments are unreliable and hard to act on."
  },
  {
   "q": "What is model induction?",
   "o": [
    "Applying the model to new data",
    "Collecting the raw data",
    "Learning the model's parameters from training data",
    "Deploying to production"
   ],
   "a": 2,
   "e": "Induction estimates f* from historical data."
  },
  {
   "q": "What is prediction, in the induction–prediction framework?",
   "o": [
    "Estimating the parameters",
    "Applying the learned model f* to new inputs",
    "Cleaning the data",
    "Forming the segments"
   ],
   "a": 1,
   "e": "Ŷ = f*(X′) for a new case such as a new student."
  },
  {
   "q": "Training and test R² are similar. What does that suggest?",
   "o": [
    "The model generalizes well",
    "The model is overfitting",
    "The model is certainly underfitting",
    "There must be data leakage"
   ],
   "a": 0,
   "e": "A large drop from training to test would signal overfitting."
  }
 ],
 "14": [
  {
   "q": "What is the goal of supervised segmentation, in terms of E[Y | X ∈ Sᵢ]?",
   "o": [
    "Segments with identical expected outcomes",
    "Segments independent of the target",
    "Segments whose expected outcomes differ from each other",
    "Segments of equal size"
   ],
   "a": 2,
   "e": "Each segment should be internally uniform and distinct from the others in outcome."
  },
  {
   "q": "Which chart best shows what share of borrowers falls in each segment?",
   "o": [
    "Box plot",
    "Donut or pie chart",
    "ROC curve",
    "Parallel coordinates"
   ],
   "a": 1,
   "e": "Composition is about proportions of a whole."
  },
  {
   "q": "What does a box plot of income by segment test?",
   "o": [
    "How consistent each segment is internally",
    "The segments' share of the total",
    "A trend over time",
    "Causality"
   ],
   "a": 0,
   "e": "Narrow boxes mean homogeneous segments; separated boxes mean distinct ones."
  },
  {
   "q": "How is a rule extracted from a decision tree?",
   "o": [
    "Join every split in the tree with OR",
    "Use only the root split",
    "Pick splits at random",
    "Join the split conditions along a root-to-leaf path with AND; the leaf gives the THEN part"
   ],
   "a": 3,
   "e": "For example: IF age ≤ 30 AND student = yes THEN buys = yes."
  },
  {
   "q": "A leaf holds 8 “yes” and 2 “no” samples. What is P(yes)?",
   "o": [
    "0.2",
    "0.5",
    "0.8",
    "8"
   ],
   "a": 2,
   "e": "Leaf probability = class count ÷ leaf size = 8 ÷ 10."
  },
  {
   "q": "With Laplace smoothing, what is P(yes) for a leaf with 3 “yes” out of 3 (two classes)?",
   "o": [
    "1.0",
    "0.8",
    "0.5",
    "0.75"
   ],
   "a": 1,
   "e": "(3 + 1) ÷ (3 + 2) = 0.8."
  },
  {
   "q": "Why use Laplace smoothing?",
   "o": [
    "To stop small leaves from giving overconfident probabilities",
    "To make accuracy 100%",
    "To remove leaves",
    "To speed up training"
   ],
   "a": 0,
   "e": "A leaf with only a few samples shouldn't claim certainty."
  },
  {
   "q": "How does a random forest estimate a class probability?",
   "o": [
    "It takes the largest tree's value",
    "It multiplies the trees' probabilities",
    "It uses only the first tree",
    "It averages the leaf probabilities from all its trees"
   ],
   "a": 3,
   "e": "Averaging many trees gives steadier estimates than one tree."
  },
  {
   "q": "The loan rules left applicants earning ≤ ₹50,000 with credit scores above 600 uncovered. This shows the need to check a rule set's…",
   "o": [
    "Accuracy",
    "Pruning",
    "Coverage",
    "Lift"
   ],
   "a": 2,
   "e": "Complete rule sets give every case exactly one rule."
  },
  {
   "q": "Which is a known limitation of decision trees?",
   "o": [
    "They can't handle categorical data",
    "Instability: small changes in the data can produce different rules",
    "They can't be interpreted",
    "They require feature scaling"
   ],
   "a": 1,
   "e": "Ensembles such as random forests reduce this instability."
  }
 ],
 "15": [
  {
   "q": "Which question does prescriptive analytics answer?",
   "o": [
    "What happened?",
    "Why did it happen?",
    "What will happen?",
    "What should we do?"
   ],
   "a": 3,
   "e": "It recommends actions by combining predictions with optimization and simulation."
  },
  {
   "q": "In a linear program, where does the optimal solution lie?",
   "o": [
    "At the center of the region",
    "Outside the region",
    "At a corner (vertex) of the feasible region",
    "At a random point"
   ],
   "a": 2,
   "e": "The iso-profit line leaves the feasible region last at a corner."
  },
  {
   "q": "In Z = f(x₁, …, xₙ) subject to gᵢ(x) ≤ bᵢ, the xᵢ are the…",
   "o": [
    "Constraints",
    "Decision variables",
    "Objective",
    "Fixed parameters"
   ],
   "a": 1,
   "e": "They are what we control, such as how many chairs and tables to make."
  },
  {
   "q": "What is a binding constraint?",
   "o": [
    "One that is fully used up at the optimum",
    "One with plenty of slack",
    "One that makes the problem infeasible",
    "Another name for the objective"
   ],
   "a": 0,
   "e": "Relaxing a binding constraint, such as adding machine hours, would raise profit."
  },
  {
   "q": "An offer costs ₹1,200, saves 40% of would-be churners, and a customer is worth ₹6,000. Above what churn probability is the offer worth it?",
   "o": [
    "0.7",
    "0.2",
    "0.4",
    "0.5"
   ],
   "a": 3,
   "e": "Break-even: p × 0.4 × 6,000 = 1,200 gives p = 0.5."
  },
  {
   "q": "Why might the slides' 0.70 churn threshold not be optimal?",
   "o": [
    "The best threshold is always 0.5",
    "The predictions keep changing",
    "The best threshold depends on the costs and benefits of the offer",
    "Regulations fix it"
   ],
   "a": 2,
   "e": "The prediction stays the same, but the prescription changes with the economics."
  },
  {
   "q": "A lost sale costs more than an unsold unit. Compared with the average forecast, you should order…",
   "o": [
    "Less than the average",
    "More than the average",
    "Exactly the average",
    "Nothing"
   ],
   "a": 1,
   "e": "Running out is costlier, so it pays to stock above the mean."
  },
  {
   "q": "With a profit of ₹300 per sale and a ₹100 loss per unsold unit, what is the critical ratio?",
   "o": [
    "0.75",
    "0.25",
    "3",
    "0.5"
   ],
   "a": 0,
   "e": "300 ÷ (300 + 100) = 0.75: stock up to the 75th percentile of demand."
  },
  {
   "q": "How are large driver-to-route assignment problems usually solved?",
   "o": [
    "Regression",
    "K-means clustering",
    "Chi-square tests",
    "Linear programming or the Hungarian algorithm"
   ],
   "a": 3,
   "e": "Checking every possibility becomes impossible as problems grow."
  },
  {
   "q": "What is the main dependency risk of prescriptive models?",
   "o": [
    "They need no data",
    "They are always optimal",
    "They are only as good as the predictions and assumptions behind them",
    "They ignore constraints"
   ],
   "a": 2,
   "e": "Bad forecasts lead to bad recommendations."
  }
 ],
 "16": [
  {
   "q": "In Y = W₀ + W₁X + ε, what does the slope W₁ represent?",
   "o": [
    "The change in Y for a one-unit increase in X",
    "The value of Y when X = 0",
    "The random error",
    "The R² of the model"
   ],
   "a": 0,
   "e": "In the advertising example, each ₹1 lakh of spend adds about ₹1.85 lakh of sales."
  },
  {
   "q": "What does least-squares regression minimize?",
   "o": [
    "The sum of the X values",
    "The absolute slope",
    "The number of data points",
    "The sum of squared vertical errors"
   ],
   "a": 3,
   "e": "It chooses the line with the smallest total squared distance from the points."
  },
  {
   "q": "What is the least-squares line for X = 10, 20, 30, 40 and Y = 25, 40, 60, 80?",
   "o": [
    "Y = 5 + 2X",
    "Y = 1.85 + 5X",
    "Y = 5 + 1.85X",
    "Y = 2X"
   ],
   "a": 2,
   "e": "Slope = 925 ÷ 500 = 1.85; intercept = 51.25 − 1.85 × 25 = 5. It predicts 97.5 at X = 50."
  },
  {
   "q": "What happens when you add a useless predictor to a regression?",
   "o": [
    "Both fall",
    "R² never falls, but adjusted R² can fall",
    "Both always rise by the same amount",
    "R² falls"
   ],
   "a": 1,
   "e": "Adjusted R² penalizes the extra complexity, exposing useless predictors."
  },
  {
   "q": "Residuals that fan out as fitted values grow indicate…",
   "o": [
    "Heteroscedasticity (non-constant variance)",
    "A perfect fit",
    "Independence",
    "Multicollinearity"
   ],
   "a": 0,
   "e": "It makes p-values and intervals unreliable; a log transform often helps."
  },
  {
   "q": "A U-shaped pattern in the residual plot suggests…",
   "o": [
    "Unequal variance",
    "Independent errors",
    "Nothing is wrong",
    "The relationship is non-linear"
   ],
   "a": 3,
   "e": "Consider polynomial regression or transforming the variables."
  },
  {
   "q": "Logistic regression is used when the outcome is…",
   "o": [
    "A continuous number",
    "A cluster label",
    "Binary (yes/no)",
    "A time series"
   ],
   "a": 2,
   "e": "It models the probability of the outcome with an S-shaped curve."
  },
  {
   "q": "How does the Delphi method work?",
   "o": [
    "It surveys thousands of customers",
    "Anonymous experts revise their estimates over several rounds",
    "It fits a regression line",
    "It averages the last n periods"
   ],
   "a": 1,
   "e": "Anonymity keeps a senior voice from dominating, and estimates converge."
  },
  {
   "q": "What does MAPE stand for?",
   "o": [
    "Mean absolute percentage error",
    "Mean absolute error",
    "Mean squared error",
    "Maximum average prediction error"
   ],
   "a": 0,
   "e": "It expresses forecast error as a percentage of the actual values."
  },
  {
   "q": "Bias is measured as actual minus forecast. A positive bias means…",
   "o": [
    "The model over-forecasts",
    "The forecasts are perfect",
    "The data is seasonal",
    "The model under-forecasts"
   ],
   "a": 3,
   "e": "Actuals keep coming in above the forecasts."
  }
 ],
 "17": [
  {
   "q": "What does discrete-event simulation model?",
   "o": [
    "Repeated calculations with random inputs",
    "A system as a sequence of events over time, such as arrivals and service",
    "Stocks, flows and feedback loops",
    "Individual interacting agents"
   ],
   "a": 1,
   "e": "The bank-teller example is a discrete-event simulation."
  },
  {
   "q": "In the SIR epidemic model, what happens when R₀ < 1?",
   "o": [
    "The outbreak fizzles out",
    "The outbreak grows exponentially",
    "Cases stay constant",
    "Cases double each day"
   ],
   "a": 0,
   "e": "Each case infects fewer than one other person on average."
  },
  {
   "q": "What does Value at Risk (VaR) at 95% measure?",
   "o": [
    "The average loss in the worst 5% of outcomes",
    "The maximum possible loss",
    "The expected profit",
    "The loss threshold exceeded only 5% of the time"
   ],
   "a": 3,
   "e": "VaR marks the boundary of the worst 5% of outcomes."
  },
  {
   "q": "What does Conditional VaR (CVaR) measure?",
   "o": [
    "The same thing as VaR",
    "The best-case outcome",
    "The average outcome within the worst 5%, beyond the VaR threshold",
    "The median outcome"
   ],
   "a": 2,
   "e": "CVaR describes how bad the bad cases are on average."
  },
  {
   "q": "₹1,00,000 is invested with an annual return of Normal(10%, 5%). Roughly what range covers the middle 95% of profits?",
   "o": [
    "₹8,000 to ₹12,000",
    "About ₹200 to ₹19,800",
    "₹0 to ₹10,000",
    "₹5,000 to ₹15,000"
   ],
   "a": 1,
   "e": "Profit ~ Normal(₹10,000, ₹5,000), so ±1.96 SD spans ≈ ₹200 to ₹19,800."
  },
  {
   "q": "What does a tornado chart show?",
   "o": [
    "Which input drives the most uncertainty in the output",
    "The full profit distribution",
    "A time series",
    "A correlation matrix"
   ],
   "a": 0,
   "e": "In the startup example, price uncertainty mattered more than demand."
  },
  {
   "q": "Maximize Z = 3x₁ + 5x₂ subject to 2x₁ + x₂ ≤ 100 and x₁ + 3x₂ ≤ 90. What is the optimum?",
   "o": [
    "(30, 20) with Z = 190",
    "(50, 0) with Z = 150",
    "(0, 30) with Z = 150",
    "(42, 16) with Z = 206"
   ],
   "a": 3,
   "e": "Both constraints bind at the corner (42, 16); (30, 20) is feasible but not optimal."
  },
  {
   "q": "Minimize x₁² + 3x₂² subject to x₁ + x₂ = 10. What is the solution?",
   "o": [
    "x₁ = 5, x₂ = 5",
    "x₁ = 10, x₂ = 0",
    "x₁ = 7.5, x₂ = 2.5",
    "x₁ = 2.5, x₂ = 7.5"
   ],
   "a": 2,
   "e": "The Lagrange conditions give x₁ = 3x₂, and x₁ + x₂ = 10."
  },
  {
   "q": "On a function with several valleys, gradient descent may…",
   "o": [
    "Always find the global minimum",
    "Stop at a local minimum, depending on where it starts",
    "Never converge",
    "Climb to a maximum"
   ],
   "a": 1,
   "e": "Restarts from several points, or global methods, help avoid this trap."
  },
  {
   "q": "What happens if the learning rate in gradient descent is too large?",
   "o": [
    "The steps overshoot and oscillate",
    "It always converges faster",
    "It has no effect",
    "The algorithm stops immediately"
   ],
   "a": 0,
   "e": "Large steps jump past the valley floor."
  }
 ],
 "18": [
  {
   "q": "What is the signature of overfitting?",
   "o": [
    "Low training and test accuracy",
    "High training and test accuracy",
    "High training accuracy but low test accuracy",
    "Low training accuracy but high test accuracy"
   ],
   "a": 2,
   "e": "The model learned noise in the training data that doesn't generalize."
  },
  {
   "q": "Expected test error can be decomposed as…",
   "o": [
    "Bias + noise",
    "Bias² + variance + irreducible error",
    "Variance alone",
    "R² + RMSE"
   ],
   "a": 1,
   "e": "The irreducible error comes from noise that no model can remove."
  },
  {
   "q": "A very simple model typically has…",
   "o": [
    "High bias and low variance",
    "Low bias and high variance",
    "High bias and high variance",
    "Low bias and low variance"
   ],
   "a": 0,
   "e": "It misses the pattern the same way whichever sample it sees."
  },
  {
   "q": "How does L1 (Lasso) regularization differ from L2 (Ridge)?",
   "o": [
    "L2 performs feature selection",
    "They are identical",
    "L1 increases the weights",
    "L1 can set some weights exactly to zero"
   ],
   "a": 3,
   "e": "L1's penalty λΣ|wᵢ| produces sparse models; L2's λΣwᵢ² only shrinks."
  },
  {
   "q": "When does early stopping end training?",
   "o": [
    "When training loss reaches zero",
    "After one epoch",
    "When validation loss starts to rise",
    "Never"
   ],
   "a": 2,
   "e": "Beyond that point the network starts memorizing the training set."
  },
  {
   "q": "What does dropout do?",
   "o": [
    "Drops rows from the dataset",
    "Randomly switches off neurons during training",
    "Removes features permanently",
    "Stops training early"
   ],
   "a": 1,
   "e": "It prevents neurons from co-adapting, acting as a regularizer."
  },
  {
   "q": "A model scores 98% on training data and 68% on test data. What does this 30-point gap indicate?",
   "o": [
    "Poor generalization (overfitting)",
    "Good generalization",
    "Underfitting",
    "Nothing of concern"
   ],
   "a": 0,
   "e": "A large generalization gap is the warning sign of overfitting."
  },
  {
   "q": "In k-fold cross-validation, how many times is each sample in the test set?",
   "o": [
    "Never",
    "k times",
    "Twice",
    "Exactly once"
   ],
   "a": 3,
   "e": "Each fold takes one turn as the test set."
  },
  {
   "q": "What does stratified k-fold cross-validation preserve?",
   "o": [
    "The same number of features",
    "The original row order",
    "The same class proportions in every fold",
    "The same model in every fold"
   ],
   "a": 2,
   "e": "Each test fold then represents the whole dataset."
  },
  {
   "q": "What is the recommended evaluation practice?",
   "o": [
    "Tune hyperparameters on the test set",
    "Tune with cross-validation on the training data, then evaluate once on a locked test set",
    "Skip the test set",
    "Reuse one holdout split repeatedly for tuning"
   ],
   "a": 1,
   "e": "This gives an unbiased final estimate of generalization."
  }
 ],
 "19": [
  {
   "q": "TV campaign: P(high) = 0.5, revenue ₹25L if high and ₹8L if low, cost ₹10L. What is its EMV?",
   "o": [
    "₹16.5L",
    "₹4.5L",
    "₹12.5L",
    "₹6.5L"
   ],
   "a": 3,
   "e": "0.5 × 25 + 0.5 × 8 − 10 = 6.5."
  },
  {
   "q": "What is the accuracy paradox?",
   "o": [
    "Accuracy is always the best metric",
    "Recall is always misleading",
    "A model that flags nothing can be highly accurate yet catch no rare positives",
    "Precision can exceed 100%"
   ],
   "a": 2,
   "e": "With 2% fraud, “never fraud” is 98% accurate but has zero recall."
  },
  {
   "q": "Precision is calculated as…",
   "o": [
    "TP ÷ (TP + FN)",
    "TP ÷ (TP + FP)",
    "TN ÷ (TN + FP)",
    "(TP + TN) ÷ total"
   ],
   "a": 1,
   "e": "Of everything flagged positive, the share that really is positive."
  },
  {
   "q": "Recall is calculated as…",
   "o": [
    "TP ÷ (TP + FN)",
    "TP ÷ (TP + FP)",
    "TN ÷ (TN + FP)",
    "FP ÷ (FP + TN)"
   ],
   "a": 0,
   "e": "Of all real positives, the share that was caught."
  },
  {
   "q": "Which metric does medical screening usually prioritize?",
   "o": [
    "Precision",
    "Specificity only",
    "Accuracy",
    "Recall"
   ],
   "a": 3,
   "e": "Missing a sick patient is far costlier than an extra follow-up test."
  },
  {
   "q": "What usually happens when you lower a classifier's decision threshold?",
   "o": [
    "Precision rises and recall falls",
    "Nothing changes",
    "Recall rises and precision falls",
    "Both always rise"
   ],
   "a": 2,
   "e": "More cases are flagged: more positives are caught, but with more false alarms."
  },
  {
   "q": "A classifier's AUC is 0.5. What does that mean?",
   "o": [
    "It is a perfect classifier",
    "It ranks cases no better than random guessing",
    "It is the worst possible classifier",
    "It is a good classifier"
   ],
   "a": 1,
   "e": "AUC 1.0 is perfect ranking; 0.5 is chance."
  },
  {
   "q": "When is a precision–recall curve more informative than a ROC curve?",
   "o": [
    "When positives are rare",
    "When classes are perfectly balanced",
    "For regression problems",
    "When there is no threshold"
   ],
   "a": 0,
   "e": "ROC can look reassuring while most flagged cases are false alarms."
  },
  {
   "q": "What is the first phase of CRISP-DM?",
   "o": [
    "Modelling",
    "Deployment",
    "Evaluation",
    "Business understanding"
   ],
   "a": 3,
   "e": "Define the objective and success criteria before touching the data."
  },
  {
   "q": "Retention rose from 78% to 91%. How should the improvement be described?",
   "o": [
    "A 13% relative improvement",
    "+91 percentage points",
    "+13 percentage points, about a 16.7% relative improvement",
    "A 13-fold increase"
   ],
   "a": 2,
   "e": "Points are the absolute difference; relative change is 13 ÷ 78."
  }
 ],
 "20": [
  {
   "q": "Bayes' theorem gives P(H | E) as…",
   "o": [
    "P(E | H) × P(H) ÷ P(E)",
    "P(H) × P(E)",
    "P(E | H)",
    "P(H) ÷ P(E)"
   ],
   "a": 0,
   "e": "It updates the prior P(H) using how well the evidence fits the hypothesis."
  },
  {
   "q": "Prior churn is 15%, P(usage drop | churn) = 0.8 and P(usage drop | stay) = 0.2. After a usage drop, P(churn) is about…",
   "o": [
    "80%",
    "15%",
    "60%",
    "41%"
   ],
   "a": 3,
   "e": "0.8 × 0.15 ÷ (0.8 × 0.15 + 0.2 × 0.85) = 0.12 ÷ 0.29 ≈ 0.41."
  },
  {
   "q": "A likelihood ratio of 4 means…",
   "o": [
    "H is 4 times more likely than not",
    "The posterior probability is 4",
    "The evidence is 4 times more likely if H is true",
    "The prior is 4"
   ],
   "a": 2,
   "e": "Posterior odds = prior odds × likelihood ratio."
  },
  {
   "q": "What does naive Bayes assume?",
   "o": [
    "All features are equally important",
    "Pieces of evidence are conditionally independent given the class",
    "There is no prior",
    "Dependencies between features are modelled"
   ],
   "a": 1,
   "e": "That assumption lets the likelihoods simply be multiplied together."
  },
  {
   "q": "Does the order in which independent clues are combined change the final posterior?",
   "o": [
    "No, the result is the same in any order",
    "Yes, the order matters",
    "The last clue dominates",
    "The first clue dominates"
   ],
   "a": 0,
   "e": "Multiplication is commutative."
  },
  {
   "q": "What goes wrong if dependent pieces of evidence are multiplied as if independent?",
   "o": [
    "The posterior becomes underconfident",
    "The answer is still exact",
    "The calculation becomes impossible",
    "The same information is double-counted, giving an overconfident posterior"
   ],
   "a": 3,
   "e": "Use joint or conditional probabilities, or a Bayesian network, instead."
  },
  {
   "q": "As evidence accumulates, the belief distribution about an unknown rate…",
   "o": [
    "Widens",
    "Stays the same",
    "Narrows around the value the data supports",
    "Becomes uniform"
   ],
   "a": 2,
   "e": "More data means less uncertainty, and the prior matters less."
  },
  {
   "q": "In the network, a patient has a cough. Then we learn they have flu. What happens to P(lung disease)?",
   "o": [
    "It rises",
    "It falls",
    "It becomes certain",
    "It is unchanged"
   ],
   "a": 1,
   "e": "Flu explains the cough away, so lung disease becomes less likely."
  },
  {
   "q": "What is the Markov property?",
   "o": [
    "The next state depends only on the current state",
    "The next state depends on the full history",
    "States change at random",
    "The next state depends on future states"
   ],
   "a": 0,
   "e": "That is what makes Markov models simple and powerful."
  },
  {
   "q": "Reasoning from a symptom back to a disease is…",
   "o": [
    "Forward (predictive) reasoning",
    "Classical probability",
    "Simulation",
    "Backward (diagnostic) reasoning"
   ],
   "a": 3,
   "e": "Forward reasoning goes from cause to effect; diagnostic goes from effect to cause."
  }
 ],
 "21": [
  {
   "q": "What is a factor loading?",
   "o": [
    "The total variance explained",
    "The correlation between an observed variable and a factor",
    "An eigenvalue",
    "The error term"
   ],
   "a": 1,
   "e": "High loadings show which variables a factor represents."
  },
  {
   "q": "Under Kaiser's rule, which factors are kept?",
   "o": [
    "Those with an eigenvalue greater than 1",
    "Those with an eigenvalue less than 1",
    "Those with an eigenvalue above 0.5",
    "Only the first factor"
   ],
   "a": 0,
   "e": "A factor should explain more variance than a single standardized variable."
  },
  {
   "q": "What is communality?",
   "o": [
    "The number of factors",
    "The unique error variance",
    "The largest eigenvalue",
    "The share of a variable's variance explained by the common factors"
   ],
   "a": 3,
   "e": "It is the sum of the variable's squared loadings."
  },
  {
   "q": "What kind of rotation is Varimax?",
   "o": [
    "Oblique",
    "An extraction method",
    "Orthogonal: it keeps factors uncorrelated",
    "A scree test"
   ],
   "a": 2,
   "e": "Oblimin is the oblique alternative, allowing correlated factors."
  },
  {
   "q": "What does factor rotation change?",
   "o": [
    "The total variance explained",
    "How the explained variance is shared among the factors",
    "The data itself",
    "The number of variables"
   ],
   "a": 1,
   "e": "Communalities and the total stay the same; only the axes move."
  },
  {
   "q": "What is the circular mean of 350° and 10°?",
   "o": [
    "0°",
    "180°",
    "350°",
    "10°"
   ],
   "a": 0,
   "e": "Averaging them as unit vectors points north; the arithmetic mean, 180°, points the opposite way."
  },
  {
   "q": "A resultant length R close to 1 means…",
   "o": [
    "The directions are uniform",
    "There's an error in the data",
    "The mean direction is undefined",
    "The directions are highly concentrated"
   ],
   "a": 3,
   "e": "Circular variance = 1 − R."
  },
  {
   "q": "On a clock where 0° = midnight and 180° = noon, what time is 210°?",
   "o": [
    "8 PM",
    "7 AM",
    "2 PM",
    "10 PM"
   ],
   "a": 2,
   "e": "Each hour is 15°, and 210 ÷ 15 = hour 14."
  },
  {
   "q": "Which basis functions suit periodic data such as seasonal temperatures?",
   "o": [
    "Wavelets",
    "Fourier",
    "B-splines only",
    "Dummy variables"
   ],
   "a": 1,
   "e": "Sine and cosine terms naturally repeat each cycle."
  },
  {
   "q": "In the 10-city temperature example, what does the first functional principal component capture?",
   "o": [
    "The overall hotness level",
    "The contrast between summer and winter",
    "Measurement noise",
    "Each city's location"
   ],
   "a": 0,
   "e": "The second component captures the summer–winter contrast."
  }
 ],
 "22": [
  {
   "q": "What is KNIME?",
   "o": [
    "A programming language",
    "A relational database",
    "An open-source platform for building visual, node-based analytics workflows",
    "Only a dashboarding tool"
   ],
   "a": 2,
   "e": "You connect drag-and-drop nodes to read, clean, model and visualize data without code."
  },
  {
   "q": "What does a yellow status light on a KNIME node mean?",
   "o": [
    "Executed successfully",
    "Configured and ready to execute",
    "Failed",
    "Not configured"
   ],
   "a": 1,
   "e": "Red means not configured or failed; green means executed."
  },
  {
   "q": "Where does a node's output port connect?",
   "o": [
    "To the next node's input port",
    "Only to a database",
    "To its own configuration dialog",
    "Nowhere"
   ],
   "a": 0,
   "e": "Connected ports pass data, or a trained model, down the workflow."
  },
  {
   "q": "A Decision Tree Learner fails because of missing values. Which node should you add before it?",
   "o": [
    "Scorer",
    "Bar Chart",
    "Excel Writer",
    "Missing Value"
   ],
   "a": 3,
   "e": "It fills missing values, with the mean for example, or removes the affected rows."
  },
  {
   "q": "If the workflow has no Partitioning node, the Scorer's accuracy is…",
   "o": [
    "An honest estimate",
    "Always zero",
    "Optimistic, because it's measured on the training data",
    "Impossible to compute"
   ],
   "a": 2,
   "e": "Hold out test rows to measure performance on unseen data."
  },
  {
   "q": "What does the Joiner node do?",
   "o": [
    "Stacks two tables on top of each other",
    "Combines two tables on a key column",
    "Filters rows by a condition",
    "Draws a chart"
   ],
   "a": 1,
   "e": "It works like a SQL join; Concatenate is the node that stacks tables."
  },
  {
   "q": "What does the Scorer node produce?",
   "o": [
    "A confusion matrix and accuracy statistics",
    "A trained model",
    "A data file",
    "A joined table"
   ],
   "a": 0,
   "e": "It compares predicted labels with actual labels."
  },
  {
   "q": "What is the KNIME Hub?",
   "o": [
    "The enterprise scheduling server",
    "The desktop analytics tool",
    "A database engine",
    "A cloud repository for sharing workflows, components and extensions"
   ],
   "a": 3,
   "e": "The Business Hub or Server handles enterprise automation and deployment."
  },
  {
   "q": "Which is a limitation of KNIME?",
   "o": [
    "It isn't free to use",
    "It has no machine learning",
    "It can be slower on very large datasets, and less flexible than code",
    "It can't integrate with Python or R"
   ],
   "a": 2,
   "e": "The core Analytics Platform is free, and it integrates with Python, R and SQL."
  },
  {
   "q": "Where and when was KNIME developed?",
   "o": [
    "At Google, in 2014",
    "At the University of Konstanz, Germany, in 2004",
    "At IBM, in 1990",
    "At MIT, in 2020"
   ],
   "a": 1,
   "e": "KNIME stands for Konstanz Information Miner."
  }
 ]
};
