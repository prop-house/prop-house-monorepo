%lang starknet

struct RoundState:
    member ACTIVE : felt
    member CANCELLED : felt
    member FINALIZED : felt
end
