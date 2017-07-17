Rails.application.routes.draw do
  resources :sequences
  get "/count" => "sequences#count"
end
