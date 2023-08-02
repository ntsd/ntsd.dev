require "jekyll"
require "net/http"
require "json"

module Jekyll
  class HTTPRequest < Liquid::Tag
    def initialize(tagName, input, tokens)
      super
      @input = input
    end

    def render(context)
      # render template incase using parameters ex `https://{{ page.url }}` and split by |;
      inputs = Liquid::Template.parse(@input).render(context).strip.split("|", -1)
      if inputs.length < 3
        raise ScriptError.new("expected syntax: {% http_request <method>|<url>|<options> %} got " + inputs.join("|"))
      end

      # get input
      method = inputs[0]
      url = inputs[1]
      options = JSON.parse(inputs[2])

      Jekyll.logger.debug("requesting %s %s %s" % [method, url, options])

      uri = URI(url)

      case method
      when "POST"
        req = Net::HTTP::Post.new(uri)
      when "GET"
        req = Net::HTTP::Get.new(uri)
      when "PUT"
        req = Net::HTTP::Put.new(uri)
      else
        raise ScriptError.new("unsupported method: should be POST, PUT or GET got " + method)
      end

      # add headers
      if options["headers"]
        options["headers"].each do |header|
          Jekyll.logger.debug("add header %s %s" % [header["key"], header["value"]])
          req[header["key"]] = header["value"]
        end
      end

      # check is https
      isHTTPS = url.index("https") == 0

      # do request
      res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => isHTTPS) { |http|
        http.request(req)
      }

      # return response body
      res.body
    end
  end
end

Liquid::Template.register_tag("http_request_tag", Jekyll::HTTPRequest)

module HTTPRequestFilter
  # Jekyll 4.x comptable caching class for pre-4.x compatibility
  # ref: https://github.com/benbalter/jekyll-include-cache/blob/main/lib/jekyll-include-cache/cache.rb
  class Cache
    extend Forwardable

    def_delegators :@cache, :[]=, :key?, :delete, :clear

    def initialize(_name = nil)
      @cache = {}
    end

    def getset(key)
      if key?(key)
        @cache[key]
      else
        value = yield
        @cache[key] = value
        value
      end
    end

    def [](key)
      if key?(key)
        @cache[key]
      else
        raise
      end
    end
  end

  class << self
    def cache
      @cache ||= if defined? Jekyll::Cache
                   Jekyll::Cache.new(self.class.name)
                 else
                  HTTPRequestFilter::Cache.new
                 end
    end

    def reset
      HTTPRequestFilter.cache.clear
    end
  end

  module Filter
    def http_request_filter(url, method, headers, body)
      key = url + method + headers + body
      HTTPRequestFilter.cache.getset(key) do
        Jekyll.logger.info("requesting %s %s %s %s" % [method, url, headers, body])

        uri = URI(url)

        case method
        when "POST"
          req = Net::HTTP::Post.new(uri)
        when "GET"
          req = Net::HTTP::Get.new(uri)
        else
          raise ScriptError.new("unsupported method: should be POST or GET got " + method)
        end

        # add headers
        if headers
          headers.split("|").each do |header|
            key, value = header.split(":")
            req[key] = value
          end
        end

        # add body
        if body
          req.body = body
        end

        # check is https
        isHTTPS = url.index("https") == 0

        # do request
        res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => isHTTPS) { |http|
          http.request(req)
        }

        # return response body
        res.body
      end
    end
  end
end

Liquid::Template.register_filter(HTTPRequestFilter::Filter)
Jekyll::Hooks.register :site, :after_init do |_site|
  HTTPRequestFilter.reset
end
