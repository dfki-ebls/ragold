{ inputs, self, ... }:
{
  imports = [
    inputs.treefmt-nix.flakeModule
  ];
  systems = import inputs.systems;

  perSystem =
    {
      pkgs,
      config,
      system,
      ...
    }:
    {
      devShells.default = pkgs.callPackage ./shell.nix {
        treefmt = config.treefmt.build.wrapper;
      };
      checks = {
        inherit (config.packages) app server docker;
      };
      packages = {
        default = config.packages.app;
        app = pkgs.callPackage ./app.nix { };
        server = pkgs.callPackage ./server.nix {
          inherit (config.packages) app;
        };
        docker = pkgs.callPackage ./docker.nix {
          inherit (config.packages) server;
        };
        build-docker = pkgs.writeShellApplication {
          name = "build-docker";
          runtimeInputs = with pkgs; [ pigz ];
          text = ''
            mkdir -p ./dist
            ${config.packages.docker} | pigz -nTR -1 > ./dist/ragold-${pkgs.stdenv.hostPlatform.parsed.cpu.name}.tar.gz
          '';
        };
      };
      legacyPackages.docker-manifest = inputs.flocken.legacyPackages.${system}.mkDockerManifest {
        github = {
          enable = true;
          token = "$GH_TOKEN";
        };
        version = builtins.getEnv "VERSION";
        imageStreams = with self.packages; [ x86_64-linux.docker ];
      };
      treefmt = {
        projectRootFile = "flake.nix";
        programs = {
          biome.enable = true;
          nixfmt.enable = true;
        };
      };
    };
}
