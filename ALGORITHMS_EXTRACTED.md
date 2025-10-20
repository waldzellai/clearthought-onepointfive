# Algorithms from 'Algorithms for Decision Making'

**Total Unique Algorithms:** 41

**Book:** Kochenderfer, Wheeler, Wray (MIT Press, 2022)

**Extraction Date:** 2025-10-20


## Table of Contents


- **Chapter 2:** 1 algorithms

- **Chapter 3:** 1 algorithms

- **Chapter 4:** 2 algorithms

- **Chapter 5:** 1 algorithms

- **Chapter 6:** 1 algorithms

- **Chapter 7:** 4 algorithms

- **Chapter 8:** 3 algorithms

- **Chapter 9:** 2 algorithms

- **Chapter 11:** 4 algorithms

- **Chapter 12:** 1 algorithms

- **Chapter 15:** 1 algorithms

- **Chapter 16:** 2 algorithms

- **Chapter 17:** 1 algorithms

- **Chapter 18:** 1 algorithms

- **Chapter 19:** 2 algorithms

- **Chapter 20:** 1 algorithms

- **Chapter 21:** 5 algorithms

- **Chapter 23:** 1 algorithms

- **Chapter 24:** 2 algorithms

- **Chapter 25:** 3 algorithms

- **Chapter 26:** 1 algorithms

- **Chapter 27:** 1 algorithms


---


## Chapter 2 Algorithms


### Algorithm 2.3


**Description:** provides


**Implementation:**


```julia

Algorithm 2.3 provides an implementation for Bayesian networks with conditional
probability distributions represented as discrete factors.

  function probability(bn::BayesianNetwork, assignment)                                                          Algorithm 2.3. A function for
      subassignment(ϕ) = select(assignment, variablenames(ϕ))                                                    evaluating the probability of an
      probability(ϕ) = get(ϕ.table, subassignment(ϕ), 0.0)                                                       assignment given a Bayesian
      return prod(probability(ϕ) for ϕ in bn.factors)                                                            network bn. For example, if bn is
  end                                                                                                            as defined in example 2.5, then
                                                                                                                 a = (b=1,s=1,e=1,d=2,c=1)
                                                                                                                 probability(bn, Assignment(a))
                                                                                                                 returns 0.034228655999999996.
  In the satellite example, suppose we want to compute the probability that
nothing is wrong; that is, P(b0 , s0 , e0 , d0 , c0 ). From the chain rule,

      P ( b0 , s0 , e0 , d0 , c0 ) = P ( b0 ) P ( s0 ) P ( 

```


---


## Chapter 3 Algorithms


### Algorithm 3.9


**Description:** A


**Implementation:**


```julia

Algorithm 3.9. A method for ob-
      name = bn.vars[i].name                                                                taining P( Xi | x−i ) for a Bayesian
      val = a[name]                                                                         network bn given a current assign-
      a = delete!(copy(a), name)                                                            ment a.
      Φ = filter(ϕ -> in_scope(name, ϕ), bn.factors)
      ϕ = prod(condition(ϕ, a) for ϕ in Φ)
      return normalize!(ϕ)
  end



  Gibbs sampling can be applied to our running example. We can use our m
samples to estimate
                                           1
                                           m∑
                      P ( b1 | d1 , c1 ) ≈     ( b (i ) = 1)       (3.21)
                                             i

   Figure 3.6 compares the convergence of the estimate of P(c1 | d1 ) in the chem-
ical detection network using direct, likelihood weighted, and Gibbs sampling.
Direct sampling takes the longest to converge. The direct sampling curve has long
periods during which the estimate does not change because samples are incon-
sistent with the observations. Likelihood weighted sampling converges faster in
this example. Spikes occur when a sample is generated with C = 1, and then
gradually decrease. Gibbs sampling, in this example, quickly converges to the
true value of 0.5.
   As mentioned earlier, Gibbs sampling, like other Markov chain Monte Carlo
methods, produces samples

```


---


## Chapter 4 Algorithms


### Algorithm 4.1


**Description:** provides


**Implementation:**


```julia

Algorithm 4.1 provides an implementation of a function for
extracting these counts or statistics from a data set. The likelihood is given in



© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
                                                                        4.2. bayesian parameter learning                     75



terms of mijk :
                                           n   qi   ri
                                                           mijk
                          P( D | θ, G ) = ∏ ∏ ∏ θijk                              (4.15)
                                          i =1 j =1 k =1

Similar to the maximum likelihood estimate for the univariate distribution in
equation (4.9), the maximum likelihood estimate in our discrete Bayesian network
model is
                                         mijk
                                θ̂ijk =                                    (4.16)
                                        ∑k0 mijk0
Example 4.1 illustrates this process.

  function sub2ind(siz, x)                                                                  Algorithm 4.1. A function for ex-
      k = vcat(1, cumprod(siz[1:end-1]))                                                    tracting the statistics, or counts,
      return dot(k, x .- 1) + 1                                                             from a discrete data set D, assum-
  end         

```


---


### Algorithm 4.2


**Description:** provides


**Implementation:**


```julia

Algorithm 4.2
provides an implementation for creating a data structure holding αijk , where all
entries are 1, corresponding to a uniform prior.
   After observing data in the form of mijk counts (as introduced in section 4.1.3),
the posterior is then

              p(θij | αij , mij ) = Dir(θij | αij1 + mij1 , . . . , αijri + mijri )     (4.34)

similar to equation (4.30). Example 4.2 demonstrates this process.

  function prior(vars, G)                                                                         Algorithm 4.2. A function for gen-
      n = length(vars)                                                                            erating a prior αijk where all en-
      r = [vars[i].r for i in 1:n]                                                                tries are 1. The array of matrices
      q = [prod([r[j] for j in inneighbors(G,i)]) for i in 1:n]                                   that this function returns takes the
      return [ones(q[i], r[i]) for i in 1:n]                                                      same form as the statistics gener-
  end                                                                                             ated by algorithm 4.1. To determine
                                                                                                  the appropriate dimensions, the
                                                                                                  function takes as input the list of
                  

```


---


## Chapter 5 Algorithms


### Algorithm 5.4


**Description:** A


**Implementation:**


```julia

Algorithm 5.4. A method for de-
    if nv(G) != nv(H) || ne(G) != ne(H) ||                                                termining whether the directed
        !all(has_edge(H, e) || has_edge(H, reverse(e))                                    acyclic graphs G and H are Markov
                                         for e in edges(G))                               equivalent. The subsets function
        return false                                                                      from IterTools.jl returns all sub-
    end                                                                                   sets of a given set and a specified
    for (I, J) in [(G,H), (H,G)]                                                          size.
        for c in 1:nv(I)
            parents = inneighbors(I, c)
             for (a, b) in subsets(parents, 2)
                 if !has_edge(I, a, b) && !has_edge(I, b, a) &&
                     !(has_edge(J, a, c) && has_edge(J, b, c))
                      return false
                 end
            end
        end
    end

      return true
end




      Markov equivalence class                                                            Figure 5.5. A Markov equivalence
                                                           Member
                                                                                          class and examples of members
A                   C              E        A                  C                  E   

```


---


## Chapter 6 Algorithms


### Algorithm 6.2


**Description:** A


**Implementation:**


```julia

Algorithm 6.2. A method for com-
      ϕ = infer(M, 𝒫.bn, query, evidence)                                                     puting the value of information
      voi = -solve(𝒫, evidence, M).u                                                          of a query query given observed
      query_vars = filter(v->v.name ∈ query, 𝒫.chance_vars)                                   chance variables and their values
      for o′ in assignments(query_vars)                                                       evidence. The method addition-
          oo′ = merge(evidence, o′)                                                           ally takes a simple problem 𝒫 and
          p = ϕ.table[o′]                                                                     an inference strategy M.
          voi += p*solve(𝒫, oo′, M).u
      end
      return voi
  end



   The value of information is never negative. The expected utility can increase
only if additional observations can lead to different optimal decisions. If observing
a new variable O0 makes no difference in the choice of action, then EU ∗ (o, o 0 ) =
EU ∗ (o ) for all o 0 , in which case equation (6.9) evaluates to 0. For example, if the
optimal decision is to treat the disease regardless of the outcome of the diagnostic
test, then the value of observing the outcome of the test is 0.
   The value of information only captures the increase in expected utility from
making an observation. A cost may be associated with making a particula

```


---


## Chapter 7 Algorithms


### Algorithm 7.1


**Description:** Data


**Implementation:**


```julia

Algorithm 7.1. Data structure for
      γ # discount factor                                                                      an MDP. We will use the TR field
      𝒮 # state space                                                                          later to sample the next state and
      𝒜 # action space                                                                         reward given the current state
      T # transition function                                                                  and action: s′, r = TR(s, a). In
      R # reward function                                                                      mathematical writing, MDPs are
      TR # sample transition and reward                                                        sometimes defined in terms of
  end                                                                                          a tuple consisting of the various
                                                                                               components of the MDP, written
                                                                                               (S , A, T, R, γ).
   The rewards in an MDP are treated as components in an additively decomposed
utility function. In a finite horizon problem with n decisions, the utility associated
with a sequence of rewards r1:n is simply
                                            n
                                           ∑ rt                                  

```


---


### Algorithm 7.2


**Description:** Functions


**Implementation:**


```julia

Algorithm 7.2. Functions for com-
    𝒮, T, R, γ = 𝒫.𝒮, 𝒫.T, 𝒫.R, 𝒫.γ                                                         puting the lookahead state-action
    return R(s,a) + γ*sum(T(s,a,s′)*U(s′) for s′ in 𝒮)                                      value from a state s given an action
end                                                                                         a using an estimate of the value
function lookahead(𝒫::MDP, U::Vector, s, a)                                                 function U for the MDP 𝒫. The sec-
    𝒮, T, R, γ = 𝒫.𝒮, 𝒫.T, 𝒫.R, 𝒫.γ                                                         ond version handles the case when
    return R(s,a) + γ*sum(T(s,a,s′)*U[i] for (i,s′) in enumerate(𝒮))                        U is a vector.
end




function iterative_policy_evaluation(𝒫::MDP, π, k_max)                                      Algorithm 7.3. Iterative policy
    𝒮, T, R, γ = 𝒫.𝒮, 𝒫.T, 𝒫.R, 𝒫.γ                                                         evaluation, which iteratively com-
    U = [0.0 for s in 𝒮]                                                                    putes the value function for a pol-
    for k in 1:k_max                                                                        icy π for MDP 𝒫 with discrete state
        U = [lookahead(𝒫, U, s, π(s)) for s in 𝒮]                                           and action spaces using k_max iter-
    end                                                                            

```


---


### Algorithm 7.5


**Description:** A


**Implementation:**


```julia

Algorithm 7.5. A value function
      𝒫 # problem                                                                              policy extracted from a value func-
      U # utility function                                                                     tion U for an MDP 𝒫. The greedy
  end                                                                                          function will be used in other algo-
                                                                                               rithms.
  function greedy(𝒫::MDP, U, s)
      u, a = findmax(a->lookahead(𝒫, U, s, a), 𝒫.𝒜)
      return (a=a, u=u)
  end

  (π::ValueFunctionPolicy)(s) = greedy(π.𝒫, π.U, s).a




7.4 Policy Iteration

Policy iteration (algorithm 7.6) is one way to compute an optimal policy. It involves
iterating between policy evaluation (section 7.2) and policy improvement through
a greedy policy (algorithm 7.5). Policy iteration is guaranteed to converge given
any initial policy. It converges in a finite number of iterations because there are
finitely many policies and every iteration improves the policy if it can be improved.
Although the number of possible policies is exponential in the number of states,
policy iteration often converges quickly. Figure 7.5 demonstrates policy iteration
on the hex world problem.

  struct PolicyIteration                                                                       Algorithm 7.6. Policy iteration,
      π # initial policy                  

```


---


### Algorithm 7.10


**Description:** algorithms


**Implementation:**


```julia

Algorithm 7.10            algorithms tend to be more
provides an implementation of this.                                                          efficient in practice.



7.8 Linear Systems with Quadratic Reward

So far, we have assumed discrete state and action spaces. This section relaxes               18
                                                                                               This section assumes that the
                                                                                             problem is undiscounted and finite
this assumption, allowing for continuous, vector-valued states and actions. The
                                                                                             horizon, but these equations can be
Bellman optimality equation for discrete problems can be modified as follows:18              easily generalized.


                           © 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
                                                                2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
148   chapter 7. ex act solution methods



  struct LinearProgramFormulation end                                                          Algorithm 7.10. A method for
                                                                                               solving a discrete MDP using a
  function tensorform(𝒫::MDP)                                    

```


---


## Chapter 8 Algorithms


### Algorithm 8.4


**Description:** A


**Implementation:**


```julia

Algorithm 8.4. A method for con-
    o # position of lower-left corner                                                   ducting multilinear interpolation
    δ # vector of widths                                                                to estimate the value of state vec-
    θ # vector of values at states in S                                                 tor s for known state values θ over
end                                                                                     a grid defined by a lower-left ver-
                                                                                        tex o and vector of widths δ. Ver-
function (Uθ::MultilinearValueFunction)(s)                                              tices of the grid can all be writ-
    o, δ, θ = Uθ.o, Uθ.δ, Uθ.θ                                                          ten o + δ.*i for some nonnega-
    Δ = (s - o)./δ                                                                      tive integral vector i. The package
    # Multidimensional index of lower-left cell                                         Interpolations.jl also provides
    i = min.(floor.(Int, Δ) .+ 1, size(θ) .- 1)                                         multilinear and other interpolation
    vertex_index = similar(i)                                                           methods.
    d = length(s)
    u = 0.0
    for vertex in 0:2^d-1
        weight = 1.0
        for j in 1:d
             # Check whether jth bit is set
 

```


---


### Algorithm 8.5


**Description:** A


**Implementation:**


```julia

Algorithm 8.5. A method for con-
    o # position of lower-left corner                                                   ducting simplex interpolation to
    δ # vector of widths                                                                estimate the value of state vector
    θ # vector of values at states in S                                                 s for known state values θ over a
end                                                                                     grid defined by a lower-left vertex
                                                                                        o and a vector of widths δ. Ver-
function (Uθ::SimplexValueFunction)(s)                                                  tices of the grid can all be written
    Δ = (s - Uθ.o)./Uθ.δ                                                                o + δ.*i for some nonnegative in-
    # Multidimensional index of upper-right cell                                        tegral vector i. Simplex interpola-
    i = min.(floor.(Int, Δ) .+ 1, size(Uθ.θ) .- 1) .+ 1                                 tion is also implemented in the gen-
    u = 0.0                                                                             eral GridInterpolations.jl pack-
    s′ = (s - (Uθ.o + Uθ.δ.*(i.-2))) ./ Uθ.δ                                            age.
    p = sortperm(s′) # increasing order
    w_tot = 0.0
    for j in p
        w = s′[j] - w_tot
        u += w*Uθ.θ[i...]
        i[j] -= 1
     

```


---


### Algorithm 8.6


**Description:** provides


**Implementation:**


```julia

Algorithm 8.6 provides an implementation for evaluating and fitting linear
regression models of the value function. Example 8.3 demonstrates this approach
with the mountain car problem.


8.7 Neural Network Regression

Neural network regression relieves us of having to construct an appropriate set of
basis functions as required in linear regression. Instead, a neural network is used
to represent our value function. For a review of neural networks, see appendix D.
The input to the neural network would be the state variables, and the output
would be the utility estimate. The parameters θ would correspond to the weights
in the neural network.

© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
                                                                                                    8.8. summary 175



  mutable struct LinearRegressionValueFunction                                              Algorithm 8.6. Linear regression
      β # basis vector function                                                             value function approximation, de-
      θ # vector of parameters                                                              fined by a basis vector function
  end                                                                                       β and a vector of parameters θ.
                                                                    

```


---


## Chapter 9 Algorithms


### Algorithm 9.1


**Description:** A


**Implementation:**


```julia

Algorithm 9.1. A function that
      𝒫 # problem                                                                              runs a rollout of policy π in prob-
      π # rollout policy                                                                       lem 𝒫 from state s to depth d. It re-
      d # depth                                                                                turns the total discounted reward.
  end                                                                                          This function can be used with
                                                                                               the greedy function (introduced in
  randstep(𝒫::MDP, s, a) = 𝒫.TR(s, a)                                                          algorithm 7.5) to generate an ac-
                                                                                               tion that is likely to be an improve-
  function rollout(𝒫, s, π, d)                                                                 ment over the original rollout pol-
      ret = 0.0                                                                                icy. We will use this algorithm later
      for t in 1:d                                                                             for problems other than MDPs, re-
          a = π(s)                                                                             quiring us to only have to modify
          s, r = randstep(𝒫, s, a) 

```


---


### Algorithm 9.6


**Description:** A


**Implementation:**


```julia

Algorithm 9.6. A method for run-
      if d ≤ 0                                                                                 ning a Monte Carlo tree search
          return π.U(s)                                                                        simulation starting from state s to
      end                                                                                      depth d.
      𝒫, N, Q, c = π.𝒫, π.N, π.Q, π.c
      𝒜, TR, γ = 𝒫.𝒜, 𝒫.TR, 𝒫.γ
      if !haskey(N, (s, first(𝒜)))
          for a in 𝒜
              N[(s,a)] = 0
              Q[(s,a)] = 0.0
          end
          return π.U(s)
      end
      a = explore(π, s)
      s′, r = TR(s,a)
      q = r + γ*simulate!(π, s′, d-1)
      N[(s,a)] += 1
      Q[(s,a)] += (q-Q[(s,a)])/N[(s,a)]
      return q
  end




  bonus(Nsa, Ns) = Nsa == 0 ? Inf : sqrt(log(Ns)/Nsa)                                          Algorithm 9.7. An exploration pol-
                                                                                               icy used in Monte Carlo tree search
  function explore(π::MonteCarloTreeSearch, s)                                                 when determining which nodes to
      𝒜, N, Q, c = π.𝒫.𝒜, π.N, π.Q, π.c                                                        traverse through the search tree.
      Ns = sum(N[(s,a)] for a in 𝒜)                                                            The policy is determined by a dic-
      return argmax(a->Q[(s,a)] + c*bonus(N[(s,a)], Ns), 𝒜) 

```


---


## Chapter 11 Algorithms


### Algorithm 11.1


**Description:** A


**Implementation:**


```julia

Algorithm 11.1. A method for gen-
      τ = []                                                                                   erating a trajectory associated with
      for i = 1:d                                                                              problem 𝒫 starting in state s and
          a = π(s)                                                                             executing policy π to depth d. It
          s′, r = 𝒫.TR(s,a)                                                                    creates a vector τ containing state-
          push!(τ, (s,a,r))                                                                    action-reward tuples.
          s = s′                                                                                   This implementation does not
      end                                                                                      store the final state, as it is not
      return τ                                                                                 typically needed in the ensuing al-
  end                                                                                          gorithms. The final state after tak-
                                                                                               ing d actions should generally be
                                                                                               thought of as being part of a trajec-
   A major challenge in arriving at accurat

```


---


### Algorithm 11.2


**Description:** A


**Implementation:**


```julia

Algorithm 11.2. A method for es-
    𝒫 # problem                                                                           timating a policy gradient using fi-
    b # initial state distribution                                                        nite differences for a problem 𝒫, a
    d # depth                                                                             parameterized policy π(θ, s), and
    m # number of samples                                                                 a policy parameterization vector θ.
    δ # step size                                                                         Utility estimates are made from m
end                                                                                       rollouts to depth d. The step size is
                                                                                          given by δ.
function gradient(M::FiniteDifferenceGradient, π, θ)
    𝒫, b, d, m, δ, γ, n = M.𝒫, M.b, M.d, M.m, M.δ, M.𝒫.γ, length(θ)
    Δθ(i) = [i == k ? δ : 0.0 for k in 1:n]
    R(τ) = sum(r*γ^(k-1) for (k, (s,a,r)) in enumerate(τ))
    U(θ) = mean(R(simulate(𝒫, rand(b), s->π(θ, s), d)) for i in 1:m)
    ΔU = [U(θ + Δθ(i)) - U(θ) for i in 1:n]
    return ΔU ./ δ
end




Consider a single-state, single-step MDP with a one-dimensional continuous                Example 11.1. An example of how
                                                                                          policy parameterization has a sig-

```


---


### Algorithm 11.3


**Description:** A


**Implementation:**


```julia

Algorithm 11.3. A method for es-
      𝒫 # problem                                                                           timating a policy gradient using
      b # initial state distribution                                                        finite differences for an MDP 𝒫,
      d # depth                                                                             a stochastic parameterized policy
      m # number of samples                                                                 π(θ, s), and a policy parameter-
      δ # step size                                                                         ization vector θ. Policy variation
  end                                                                                       vectors are generated by normal-
                                                                                            izing normally distributed sam-
  function gradient(M::RegressionGradient, π, θ)                                            ples and scaling by a perturbation
      𝒫, b, d, m, δ, γ = M.𝒫, M.b, M.d, M.m, M.δ, M.𝒫.γ                                     scalar δ. A total of m parameter per-
      ΔΘ = [δ.*normalize(randn(length(θ)), 2) for i = 1:m]                                  turbations are generated, and each
      R(τ) = sum(r*γ^(k-1) for (k, (s,a,r)) in enumerate(τ))                                is evaluated in a rollout from an
      U(θ) = R(simulate(𝒫, rand(b), s->π(θ,s), d))                              

```


---


### Algorithm 11.4


**Description:** A


**Implementation:**


```julia

Algorithm 11.4. A method for esti-
      𝒫 # problem                                                                                                 mating a policy gradient of a pol-
      b # initial state distribution                                                                              icy π(s) for an MDP 𝒫 with initial
      d # depth                                                                                                   state distribution b using the likeli-
      m # number of samples                                                                                       hood ratio trick. The gradient with
      ∇logπ # gradient of log likelihood                                                                          respect to the parameterization vec-
  end                                                                                                             tor θ is estimated from m rollouts to
                                                                                                                  depth d using the log policy gradi-
  function gradient(M::LikelihoodRatioGradient, π, θ)                                                             ents ∇logπ.
      𝒫, b, d, m, ∇logπ, γ = M.𝒫, M.b, M.d, M.m, M.∇logπ, M.𝒫.γ
      πθ(s) = π(θ, s)
      R(τ) = sum(r*γ^(k-1) for (k, (s,a,r)) in enumerate(τ))
      ∇U(τ) = sum(∇logπ(θ, a, s) for (s,a) in τ)*R(τ)
      return mean(∇U(simulate(𝒫, rand(b), πθ, d)) for i in 1:m)
  end




11.4 Rewar

```


---


## Chapter 12 Algorithms


### Algorithm 12.2


**Description:** Methods


**Implementation:**


```julia

Algorithm 12.2. Methods for gra-
  clip_gradient(∇, a, b) = clamp.(∇, a, b)                                                     dient scaling and clipping. Gradi-
                                                                                               ent scaling limits the magnitude
                                                                                               of the provided gradient vector ∇
                                                                                               to L2_max. Gradient clipping pro-
   Scaling and clipping differ in how they affect the final gradient direction, as             vides elementwise clamping of the
demonstrated in figure 12.1. Scaling will leave the direction unaffected, whereas              provided gradient vector ∇ to be-
                                                                                               tween a and b.
clipping affects each component individually. Whether this difference is advanta-
geous depends on the problem. For example, if a single component dominates
the gradient vector, scaling will zero out the other components.


© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
                                                                                 12.2. restricted gradient update 251



                                                                   0       

```


---


## Chapter 15 Algorithms


### Algorithm 15.1


**Description:** defines


**Implementation:**


```julia

Algorithm 15.1 defines the simulation loop for a bandit problem. At each step,
we evaluate our exploration policy π on our current model of the payoff probabil-
ities to generate an action a. The next section will discuss a way to model payoff
probabilities, and the remainder of the chapter will outline several exploration
strategies. After obtaining a, we simulate a pull of that arm, returning binary
reward r. The model is then updated using the observed a and r. The simulation
loop is repeated to horizon h.

  struct BanditProblem                                                                         Algorithm 15.1. Simulation of a
      θ # vector of payoff probabilities                                                       bandit problem. A bandit problem
      R # reward sampler                                                                       is defined by a vector θ of payoff
  end                                                                                          probabilities, one per action. We
                                                                                               also define a function R that simu-
  function BanditProblem(θ)                                                                    lates the generation of a stochastic
      R(a) = rand() < θ[a] ? 1 : 0                                                             binary reward in response to the se-
      return BanditProblem(θ, R)                                           

```


---


## Chapter 16 Algorithms


### Algorithm 16.1


**Description:** A


**Implementation:**


```julia

Algorithm 16.1. A method for up-
    𝒮 # state space (assumes 1:nstates)                                                 dating the transition and reward
    𝒜 # action space (assumes 1:nactions)                                               model for maximum likelihood re-
    N # transition count N(s,a,s′)                                                      inforcement learning with discrete
    ρ # reward sum ρ(s, a)                                                              state and action spaces. We incre-
    γ # discount                                                                        ment N[s,a,s′] after observing a
    U # value function                                                                  transition from s to s′ after taking
    planner                                                                             action a, and we add r to ρ[s,a].
end                                                                                     The model also contains an esti-
                                                                                        mate of the value function U and
function lookahead(model::MaximumLikelihoodMDP, s, a)                                   a planner. This algorithm block
    𝒮, U, γ = model.𝒮, model.U, model.γ                                                 also includes methods for perform-
    n = sum(model.N[s,a,:])                                                             ing backup and lookahead with re-
    

```


---


### Algorithm 16.8


**Description:** provides


**Implementation:**


```julia

Algorithm 16.8 provides an implementation of the Bayesian update for this type
of posterior model. For problems with larger or continuous spaces, we can use
other posterior representations.




© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
                                                                                                     16.4. bayesian methods 327




Suppose our agent randomly explores an environment with three states. The                                Example 16.3. A posterior Dirichlet
                                                                                                         distribution over transition proba-
agent takes action a1 from state s1 five times. It transitions to s3 four times                          bilities from a particular state when
and remains in s1 once. The counts associated with s1 and a1 are N(s1 , a1 ) =                           taking a particular action. An agent
                                                                                                         learning the transition function in
[1, 0, 4]. If we want to assume a uniform prior over resulting states, we would                          an unknown MDP may choose to
increment the counts by 1 to get N(s1 , a1 ) = [2, 1, 5]. The transition function                        maintain such a distribution over
from s1 taking action a1 is a 

```


---


## Chapter 17 Algorithms


### Algorithm 17.1


**Description:** A


**Implementation:**


```julia

Algorithm 17.1. A type for main-
    μ # mean estimate                                                                    taining an incremental estimate of
    α # learning rate function                                                           the mean of a random variable. The
    m # number of updates                                                                associated type maintains a cur-
end                                                                                      rent mean value μ, a learning rate
                                                                                         function α, and an iteration count m.
function update!(model::IncrementalEstimate, x)                                          Calling update! with a new value
    model.m += 1                                                                         x updates the estimate.
    model.μ += model.α(model.m) * (x - model.μ)
    return model
end




                       © 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
                                                            2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
338 chapter 17. model-free methods



We can use equation (17.6) to produce an incremental update rule to estimate
the action value function:5                                                                    5
                                                                                

```


---


## Chapter 18 Algorithms


### Algorithm 18.4


**Description:** A


**Implementation:**


```julia

Algorithm 18.4. A structure for in-
      𝒫 # problem                                                                                          verse reinforcement learning and
      b # initial state distribution                                                                       a method for estimating a feature
      d # depth                                                                                            expectations vector from rollouts.
      m # number of samples
      π # parameterized policy
      β # binary feature mapping
      μE # expert feature expectations
      RL # reinforcement learning method
      ϵ # tolerance
  end

  function feature_expectations(M::InverseReinforcementLearning, π)
      𝒫, b, m, d, β, γ = M.𝒫, M.b, M.m, M.d, M.β, M.𝒫.γ
      μ(τ) = sum(γ^(k-1)*β(s, a) for (k,(s,a)) in enumerate(τ))
      τs = [simulate(𝒫, rand(b), π, d) for i in 1:m]
      return mean(μ(τ) for τ in τs)
  end



   We can use the expert demonstrations to estimate the expert feature expecta-
tions µE , and we want to find a policy that matches these feature expectations
as closely as possible. At the first iteration, we begin with a randomized policy
π (1) and estimate its feature expectations, denoted as µ(1) . At iteration k, we find
a new φ(k) corresponding to a reward function Rφ(k) (s, a) = φ(k)> β(s, a), such

© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@al

```


---


## Chapter 19 Algorithms


### Algorithm 19.4


**Description:** The


**Implementation:**


```julia

Algorithm 19.4. The extended
      μb # mean vector                                                                         Kalman filter, an extension of the
      Σb # covariance matrix                                                                   Kalman filter to problems with
  end                                                                                          nonlinear Gaussian dynamics. The
                                                                                               current belief is represented by
  import ForwardDiff: jacobian                                                                 mean μb and covariance Σb. The
  function update(b::ExtendedKalmanFilter, 𝒫, a, o)                                            problem 𝒫 specifies the nonlinear
      μb, Σb = b.μb, b.Σb                                                                      dynamics using the mean tran-
      fT, fO = 𝒫.fT, 𝒫.fO                                                                      sition dynamics function fT and
      Σs, Σo = 𝒫.Σs, 𝒫.Σo                                                                      mean observation dynamics func-
      # predict                                                                                tion fO. The Jacobians are obtained
      μp = fT(μb, a)                                                                           using the ForwardDiff.jl pack-
      Ts = jacobian(s->fT(s, a), μb)                                

```


---


### Algorithm 19.2


**Description:** handles


**Implementation:**


```julia

Algorithm 19.2 handles
this case by returning a uniform belief. In practical applications, there may be a mismatch
between the model and the real world. We generally want to be careful to avoid assigning
zero probability to observations, just in case our belief, transition, or observations models
are incorrect.

Exercise 19.10. Suppose we are performing in-flight monitoring of an aircraft. The aircraft
is either in a state of normal operation s0 or a state of malfunction s1 . We receive observa-
tions through the absence of a warning w0 or the presence of a warning w1 . We can choose
to allow the plane to continue to fly m0 or send the plane in for maintenance m1 . We have
the following transition and observation dynamics, where we assume that the warnings
are independent of the actions, given the status of the plane:

                    T (s0 | s0 , m0 ) = 0.95                  O(w0 | s0 ) = 0.99
                    T ( s0 | s0 , m1 ) = 1                    O(w1 | s1 ) = 0.7
                    T ( s1 | s1 , m0 ) = 1
                    T (s0 | s1 , m1 ) = 0.98

Given the initial belief b = [0.95, 0.05], compute the updated belief b0 , given that we allow
the plane to continue to fly and we observe a warning.

Solution: Using equation (19.7), we update the belief for s0 :

               b0 (s0 ) ∝ O(w1 | s0 ) ∑ T (s0 | s, m0 )b(s)
                                             s
                0
               b (s ) ∝ O(w | s )( T (s0 | s0 , m0 )b(s0 ) + T (s0 | s1 , m0 )b

```


---


## Chapter 20 Algorithms


### Algorithm 20.6


**Description:** provides


**Implementation:**


```julia

Algorithm 20.6 provides
an implementation for solving equation (20.16) to determine a belief, if one exists,
where δ is most positive.

  function find_maximal_belief(α, Γ)                                                         Algorithm 20.6. A method for find-
      m = length(α)                                                                          ing the belief vector b for which
      if isempty(Γ)                                                                          the alpha vector α improves the
          return fill(1/m, m) # arbitrary belief                                             most compared to the set of alpha
      end                                                                                    vectors Γ. Nothing is returned if
      model = Model(GLPK.Optimizer)                                                          no such belief exists. The packages
      @variable(model, δ)                                                                    JuMP.jl and GLPK.jl provide a
      @variable(model, b[i=1:m] ≥ 0)                                                         mathematical optimization frame-
      @constraint(model, sum(b) == 1.0)                                                      work and a solver for linear pro-
      for a in Γ                                                                             grams, respectively.
          @constraint(model, (α-a)⋅b ≥ δ)
      end
      @objective(model, Max, δ)
      optimize!(model)
    

```


---


## Chapter 21 Algorithms


### Algorithm 21.1


**Description:** Iteration


**Implementation:**


```julia

Algorithm 21.1. Iteration structure
      for k in 1:M.k_max                                                              for updating a set of alpha vec-
          Γ = update(𝒫, M, Γ)                                                         tors Γ used by several of the meth-
      end                                                                             ods in this chapter. The various
      return Γ                                                                        methods, including QMDP, differ
  end                                                                                 in their implementation of update.
                                                                                      After k_max iterations, this function
                                                                                      returns a policy represented by the
                                                                                      alpha vectors in Γ.
428 chapter 21. offline belief state planning



   QMDP (algorithm 21.2) constructs a single alpha vector αa for each action a
using value iteration. Each alpha vector is initialized to zero, and then we iterate:

                                (s) = R(s, a) + γ ∑ T (s0 | s, a) max α a0 (s0 )
                      ( k +1)                                             (k)
                     αa                                                                      (21.1)
                                      

```


---


### Algorithm 21.4


**Description:** Implementation


**Implementation:**


```julia

Algorithm 21.4. Implementation
      r = maximum(minimum(R(s, a) for s in 𝒮) for a in 𝒜) / (1-γ)                                of the best-action worst-state lower
      α = fill(r, length(𝒮))                                                                     bound from equation (21.5) repre-
      return α                                                                                   sented as an alpha vector.
  end



   The blind lower bound (algorithm 21.5) represents a lower bound with one alpha
vector per action. It makes the assumption that we are forced to commit to a single
action forever, blind to what we observe in the future. To compute these alpha
vectors, we start with another lower bound (typically the best-action worst-state
lower bound) and then perform a number of iterations:

                              (s) = R(s, a) + γ ∑ T (s0 | s, a)α a (s0 )
                    ( k +1)                                       (k)
                   αa                                                                  (21.6)
                                                  s0

This iteration is similar to the QMDP update in equation (21.1), except that it
does not have a maximization over the alpha vectors on the right-hand side.


21.4   Point-Based Value Iteration

QMDP and the fast informed bound generate one alpha vector for each action,
but the optimal value function is often better approximated by many more

                               © 2022 Massachusetts In

```


---


### Algorithm 21.6


**Description:** A


**Implementation:**


```julia

Algorithm 21.6. A method for back-
      𝒮, 𝒜, 𝒪, γ = 𝒫.𝒮, 𝒫.𝒜, 𝒫.𝒪, 𝒫.γ                                                        ing up a belief for a POMDP with
      R, T, O = 𝒫.R, 𝒫.T, 𝒫.O                                                                discrete state and action spaces,
      Γa = []                                                                                where Γ is a vector of alpha vectors
      for a in 𝒜                                                                             and b is a belief vector at which
          Γao = []                                                                           to apply the backup. The update
          for o in 𝒪                                                                         method for vector beliefs is defined
              b′ = update(b, 𝒫, a, o)                                                        in algorithm 19.2.
              push!(Γao, argmax(α->α⋅b′, Γ))
          end
          α = [R(s, a) + γ*sum(sum(T(s, a, s′)*O(a, s′, o)*Γao[i][j]
              for (j,s′) in enumerate(𝒮)) for (i,o) in enumerate(𝒪))
              for s in 𝒮]
          push!(Γa, α)
      end
      return argmax(α->α⋅b, Γa)
  end




21.5   Randomized Point-Based Value Iteration

Randomized point-based value iteration (algorithm 21.8) is a variation of the point-
based value iteration approach from the previous section.7 The primary difference            7
                                                               

```


---


### Algorithm 21.11


**Description:** A


**Implementation:**


```julia

Algorithm 21.11. A function for
      s = rand(SetCategorical(𝒫.𝒮, b))                                                         randomly sampling the next belief
      s′, r, o = 𝒫.TRO(s, a)                                                                   b′ and reward r, given the current
      b′ = update(b, 𝒫, a, o)                                                                  belief b and action a in problem 𝒫.
      return b′, r
  end



   We can create B from the belief states reachable from some initial belief under
a random policy. This random belief expansion procedure (algorithm 21.12) may
explore much more of the belief space than might be necessary; the belief space
reachable by a random policy can be much larger than the space reachable by
an optimal policy. Of course, computing the belief space that is reachable by an
optimal policy generally requires knowing the optimal policy, which is what
we want to compute in the first place. One approach that can be taken is to use
successive approximations of the optimal policy to iteratively generate B.9                    9
                                                                                                This is the intuition behind the
   In addition to wanting our belief points to be focused on the reachable belief              algorithm known as Successive Ap-
                                                                                               proximations of the Reachable Space
space, we 

```


---


### Algorithm 21.15


**Description:** extracts


**Implementation:**


```julia

Algorithm 21.15 extracts this utility function and policy from the pairs in V.
   Algorithm 21.16 applies a variation of approximate value iteration (introduced
in algorithm 8.1) to our triangulated policy representation. We simply iteratively
apply backups over our beliefs in B using one-step lookahead with our value
function interpolation. If U is initialized with an upper bound, value iteration will        15
                                                                                                See lemma 4 of W. S. Lovejoy,
result in an upper bound even after a finite number of iterations. This property             “Computationally Feasible Bounds
                                                                                             for Partially Observed Markov De-
holds because value functions are convex and the linear interpolation between ver-           cision Processes,” Operations Re-
tices on the value function must lie on or above the underlying convex function.15           search, vol. 39, no. 1, pp. 162–175,
                                                                                             1991.
Figure 21.10 shows an example of a policy and utility function.

                           © 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
                                                                2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
446 chapter 21. offline belief

```


---


## Chapter 23 Algorithms


### Algorithm 23.1


**Description:** provides


**Implementation:**


```julia

Algorithm 23.1 provides
an implementation, and example 23.1 shows a controller for the crying baby
problem.
    Controllers generalize conditional plans, which were introduced in section 20.2.
Conditional plans represent policies as trees, with each node deterministically
assigning an action and each edge specifying a unique successor node. Controllers
represent policies as directed graphs, and actions may have stochastic transitions
to multiple successor nodes. Example 23.2 compares these two representations.
472 chapter 23. controller abstractions




              η ( x 0 | x, a, o )             η ( x 0 | x, a, o )               η ( x 0 | x, a, o )        Figure 23.1. In a controller rep-
    x1                              x2                               x3                               x4   resentation, the action is sampled
                                                                                                           from the action selection distribu-
         ψ( a | x )                      ψ( a | x )                       ψ( a | x )                       tion. This action, as well as the sub-
                                                                                                           sequent observation it produces,
         a1                              a2                                a3                              are used alongside the previous
                                                                                        

```


---


## Chapter 24 Algorithms


### Algorithm 24.1


**Description:** Data


**Implementation:**


```julia

Algorithm 24.1. Data structure for
      γ # discount factor                                                                      a simple game.
      ℐ # agents
      𝒜 # joint action space
      R # joint reward function
  end
494 chapter 24. multiagent reasoning



  The prisoner’s dilemma is a two-agent, two-action game involving two pris-                       Example 24.1. A simple game
                                                                                                   known as the prisoner’s dilemma.
  oners that are on trial. They can choose to cooperate and remain silent about                    Additional detail is provided in ap-
  their shared crime, or defect and blame the other for their crime. If they both                  pendix F.10.
  cooperate, they both serve a sentence of one year. If agent i cooperates and
                                                                                                                                agent 2
  the other agent defects, then i serves four years and the other serves no time.
                                                                                                                          cooperate   defect
  If both defect, then they both serve three years.




                                                                                                              cooperate
     Two-agent simple games can be represented by a table. Rows represent
                                   

```


---


### Algorithm 24.2


**Description:** implements


**Implementation:**


```julia

Algorithm 24.2 implements routines for representing policies and computing
their utility.
   A zero-sum game is a type of simple game where the sum of rewards across
agents is zero. Here, any gain of an agent results as a loss to the other agents.
A zero-sum game with two agents I = {1, 2} has opposing reward functions
R1 (a) = − R2 (a). They are typically solved with algorithms specialized for this
reward structure. Example 24.2 describes such a game.


24.2 Response Models

Before exploring different concepts for solving for a joint policy, we will begin by
discussing how to model the response of a single agent i, given fixed policies for the
other agents. We will use the notation −i as shorthand for (1, . . . , i − 1, i + 1, . . . , k).
Using this notation, a joint action is written as a = ( ai , a−i ), a joint reward is
written as R( ai , a−i ), and a joint policy is written as π = (π i , π−i ). This section
discusses various approaches for computing a response to a known π−i .


© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
                                                                                                                 24.2. response models               495



  Rock-paper-scissors is a zero-sum game for two agents. Each agent selects                                            Example 24.2. The well-known
                                  

```


---


## Chapter 25 Algorithms


### Algorithm 25.1


**Description:** Data


**Implementation:**


```julia

Algorithm 25.1. Data structure for
      γ # discount factor                                                               an MG.
      ℐ # agents
      𝒮 # state space
      𝒜 # joint action space
      T # transition function
      R # joint reward function
  end
518 chapter 25. s equential problems



  Consider commuters headed to work by car. Each car has a starting position                   Example 25.1. Traffic routing as an
                                                                                               MG. The problem cannot be mod-
  and a destination. Each car can take any of several available roads to get to                eled using a single agent model like
  their destination, but these roads vary in the time it takes to drive them. The              an MDP because we do not know
                                                                                               the behavior of other agents, only
  more cars that drive on a given road, the slower they all move.                              their rewards. We can try to find
     This problem is an MG. The agents are the commuters in their cars, the                    equilibria or learn policies through
  states are the locations of all the cars on the roads, and the actions corre-                interaction, similar to what we did
                                                                                               for simple games.
  spond to decisions of which road to take n

```


---


### Algorithm 25.6


**Description:** Functions


**Implementation:**


```julia

Algorithm 25.6. Functions for tak-
      s′ = rand(SetCategorical(𝒫.𝒮, [𝒫.T(s, a, s′) for s′ in 𝒫.𝒮]))                         ing a random step and running full
      r = 𝒫.R(s,a)                                                                          simulations in MGs. The simulate
      return s′, r                                                                          function will simulate the joint pol-
  end                                                                                       icy π for k_max steps starting from
                                                                                            a state randomly sampled from b.
  function simulate(𝒫::MG, π, k_max, b)
      s = rand(b)
      for k = 1:k_max
          a = Tuple(πi(s)() for πi in π)
          s′, r = randstep(𝒫, s, a)
          for πi in π
               update!(πi, s, a, s′)
          end
          s = s′
      end
      return π
  end




  After observing joint action a in states s, we update

                           N ( j, a j , s) ← N ( j, a j , s) + 1                 (25.10)

for each agent j.
   As the distributions of the other agents’ actions change, we must update the
utilities. The utilities in MGs are significantly more difficult to compute than
simple games because of the state dependency. As described in section 25.2.1, any

```


---


### Algorithm 25.7


**Description:** performs


**Implementation:**


```julia

Algorithm 25.7 performs a single backup for the visited state s and all joint actions
a. This approach has the benefit of being relatively efficient because it is a single backup.
Updating all joint actions at that state results in exploring actions that were not observed.
The drawback of this approach is that we may need to do this update at all states many
times to obtain a suitable policy.
    An alternative is only to update the visited state and the joint action that was actually
taken, which results in a faster update step. The drawback is that it requires many more
steps to explore the full range of joint actions.
    Another alternative is to perform value iteration at all states s until convergence at every
update step. Recall that the model of the opponent changes on each update. This induces a
new MDP, as described for deterministic best response in section 25.2.1. Consequently, we
would need to rerun value iteration after each update. The benefit of this approach is that
it can result in the most informed decision at each step because the utilities Qi consider all
states over time. The drawback is that the update step is very computationally expensive.




                              © 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
                                                                   2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
26 State Uncertainty

The multiagent models discusse

```


---


## Chapter 26 Algorithms


### Algorithm 26.1


**Description:** Data


**Implementation:**


```julia

Algorithm 26.1. Data structure for
      𝒮 # state space                                                                          a POMG.
      𝒜 # joint action space
      𝒪 # joint observation space
      T # transition function
      O # joint observation function
      R # joint reward function
  end




  Consider a multiagent POMG generalization of the crying baby problem.                        Example 26.1. The multicaregiver
                                                                                               crying baby problem as a POMG.
  We have two caregivers taking care of a baby. As in the POMDP version, the                   Appendix F.14 provides additional
  states are the baby being hungry or sated. Each caregiver’s actions are to feed,             details.
  sing, or ignore the baby. If both caregivers choose to perform the same action,
  the cost is halved. For example, if both caregivers feed the baby, then the
  reward is only −2.5 instead of −5. However, the caregivers do not perfectly
  observe the state of the baby. Instead, they rely on the noisy observations
  of the baby crying, both with the same observation. As a consequence of
  the reward structure, there is a trade-off between helping each other and
  greedily choosing a less costly action.




© 2022 Massachusetts Institute of Technology, shared under a Creative Commons CC-BY-NC-ND license.
2025-09-21 10:49:56-07:00, comments to bugs@algorithmsbook.com
                            

```


---


## Chapter 27 Algorithms


### Algorithm 27.1


**Description:** Data


**Implementation:**


```julia

Algorithm 27.1. Data structure
      γ # discount factor                                                                      for a Dec-POMDP. The joint func-
      ℐ # agents                                                                               tion from algorithm 24.2 allows the
      𝒮 # state space                                                                          creation of all combinations of a
      𝒜 # joint action space                                                                   set provided, such as 𝒜 or 𝒪. The
      𝒪 # joint observation space                                                              tensorform function converts the
      T # transition function                                                                  Dec-POMDP 𝒫 to a tensor represen-
      O # joint observation function                                                           tation.
      R # reward function
  end




27.2 Subclasses

There are many notable subclasses of Dec-POMDPs. Categorizing these subclasses
is useful when designing algorithms that take advantage of their specific structure.
    One attribute of interest is joint full observability, which is when each agent
observes an aspect of the state, such that if they were to combine their observations,
it would uniquely reveal the true state. The agents, however, do not share their
observations. This property ensures that if O(o | a, s0 ) > 0 then P(s0 | o) = 1. A
Dec-POMDP with joint full observability

```


---

