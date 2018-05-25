const Random: any = require('random-js');
const Prob: any = require('prob.js');

const distributions = {
    // Uniform distribution in range [min, max). 
    uniform: (min: number, max: number) => {
        const rng = Random.engines.mt19937().seed(Math.random());
        return () => Prob.uniform(min, max)(rng);
    },

    // Normal distribution with mean and standard deviation. 
    normal: (μ: number, σ: number) => {
        const rng = Random.engines.mt19937().seed(Math.random());
        return () => Prob.normal(μ, σ)(rng);
    },

    // Exponential distribution with lambda. 
    exponential: (λ: number) => {
        const rng = Random.engines.mt19937().seed(Math.random());
        return () => Prob.exponential(λ)(rng);
    },

    // Log-normal distribution defined as ln(normal(μ, σ)). 
    lognormal: (μ: number, σ: number) => {
        const rng = Random.engines.mt19937().seed(Math.random());
        return () => Prob.lognormal(μ, σ)(rng);
    },

    // Poisson distribution returning integers >= 0. 
    poisson: (λ: number) => {
        const rng = Random.engines.mt19937().seed(Math.random());
        return () => Prob.poisson(λ)(rng);
    },

    // Zipf's distribution returning integers in range [1, N].
    zipf: (s: number, N: number) => {
        const rng = Random.engines.mt19937().seed(Math.random());
        return () => Prob.zipf(s, N)(rng);
    }
}

export default distributions;
